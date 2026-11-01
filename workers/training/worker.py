"""Worker de entrenamiento NeuroLab.

Consume trabajos de Redis (producción) o de una cola en el sistema de archivos
(desarrollo local), prepara el CSV, entrena un modelo Keras real, persiste
métricas por época y publica telemetría. La API nunca importa TensorFlow.

Uso:
    python worker.py                 # daemon continuo
    python worker.py --once          # procesa un trabajo y sale
    python worker.py --job-id <uuid> # reconstruye y ejecuta un trabajo concreto
"""

from __future__ import annotations

import argparse
import json
import logging
import os
import signal
import sys
import time
import traceback
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, Optional
from uuid import UUID

import worker_db as db
from builder import KerasModelBuilder, ModelBuildError
from evaluator import ModelEvaluator
from object_storage import ObjectStorageError, object_storage
from preprocessing import DataPreparationError, PreparedDataset, prepare_dataset
from storage import ArtifactStorageError, ArtifactStorageManager
from trainer import train_model
from worker_config import (
    CANCEL_DIR,
    DATA_DIR,
    EVENT_DIR,
    MODEL_DIR,
    PROCESSING_DIR,
    QUEUE_BACKEND,
    QUEUE_DIR,
    QUEUE_POLL_SECONDS,
    REDIS_URL,
    TEMP_DIR,
    TRAINING_QUEUE,
)
from worker_events import (
    EventPublisher,
    clear_filesystem_cancel,
    filesystem_cancel_requested,
    redis_cancel_requested,
)

logging.basicConfig(
    level=os.getenv("LOG_LEVEL", "INFO").upper(),
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("neurolab.worker")

TERMINAL = {"COMPLETED", "CANCELLED"}


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _resolve_dataset_path(storage_key: str) -> Path:
    base = Path(DATA_DIR).resolve()
    candidate = (base / storage_key).resolve()
    if candidate != base and base not in candidate.parents:
        raise DataPreparationError("Ruta de dataset inválida")
    if not candidate.exists():
        raise DataPreparationError("El archivo del dataset no existe en el almacenamiento compartido")
    return candidate


def _materialize_dataset(storage_key: str, job_id: UUID) -> Path:
    """Devuelve una ruta local al CSV, descargándolo del bucket si aplica."""
    if not object_storage.enabled:
        return _resolve_dataset_path(storage_key)

    destination = Path(TEMP_DIR) / f"{job_id}.csv"
    try:
        destination.parent.mkdir(parents=True, exist_ok=True)
        object_storage.download_to(storage_key, destination)
    except ObjectStorageError as exc:
        raise DataPreparationError(str(exc)) from exc
    return destination


class TrainingWorkerDaemon:
    def __init__(self) -> None:
        self.publisher = EventPublisher()
        self.redis_client = None
        self._stopping = False
        for directory in (QUEUE_DIR, PROCESSING_DIR, CANCEL_DIR, EVENT_DIR, MODEL_DIR):
            Path(directory).mkdir(parents=True, exist_ok=True)

    # ------------------------------------------------------------------
    # Cancelación
    # ------------------------------------------------------------------
    def _check_cancel(self, job_id: UUID) -> bool:
        if filesystem_cancel_requested(job_id):
            return True
        if redis_cancel_requested(job_id, self.publisher):
            return True
        try:
            return db.cancel_requested(job_id)
        except Exception:
            logger.debug("No fue posible consultar cancel_requested", exc_info=True)
            return False

    def _finish_cancelled(self, job_id: UUID, progress: float, reason: str = "Cancelado por el usuario") -> None:
        db.set_job_status(
            job_id,
            "CANCELLED",
            progress=min(99.0, max(0.0, progress)),
            error_message=None,
            ended_at=_now(),
        )
        job = db.get_job(job_id) or {}
        try:
            db.record_audit(
                actor_id=job.get("requested_by"),
                project_id=job.get("project_id"),
                action="TRAINING_JOB_CANCELLED",
                metadata_payload={"job_id": str(job_id), "reason": reason},
            )
        except Exception:
            logger.debug("No fue posible registrar auditoría de cancelación", exc_info=True)
        clear_filesystem_cancel(job_id)
        self.publisher.state(job_id, "CANCELLED", progress=progress, metrics_history=db.metric_history(job_id))

    # ------------------------------------------------------------------
    # Ejecución
    # ------------------------------------------------------------------
    def execute_job(self, payload: Dict[str, Any]) -> str:
        job_id = UUID(str(payload["job_id"]))
        project_id = UUID(str(payload["project_id"]))
        job = db.get_job(job_id)
        if job and job.get("status") in TERMINAL:
            logger.info("Trabajo %s ya está en estado %s; se omite.", job_id, job["status"])
            return str(job["status"])

        hyperparameters = payload.get("hyperparameters") or {}
        target_column = (payload.get("target_column") or "").strip()
        architecture = payload.get("architecture") or {}
        dataset = payload.get("dataset") or {}
        storage_key = dataset.get("storage_key")
        if not target_column or not storage_key:
            raise DataPreparationError("El payload del trabajo no contiene target_column o storage_key")

        if self._check_cancel(job_id):
            self._finish_cancelled(job_id, 0.0, "Cancelado antes de iniciar")
            return "CANCELLED"

        logger.info("==> Trabajo %s: QUEUED -> PREPARING", job_id)
        db.set_job_status(job_id, "PREPARING", progress=0.0, started_at=_now(), error_message="")
        try:
            db.clear_metrics(job_id)
        except Exception:
            logger.debug("No fue posible limpiar métricas previas", exc_info=True)
        self.publisher.state(job_id, "PREPARING", progress=0.0)

        downloaded_dataset = False
        try:
            csv_path = _materialize_dataset(str(storage_key), job_id)
            downloaded_dataset = object_storage.enabled
            validation_split = float(hyperparameters.get("validation_split", 0.15) or 0.15)
            try:
                data: PreparedDataset = prepare_dataset(
                    csv_path,
                    target_column=target_column,
                    task=payload.get("task") or dataset.get("metadata_json", {}).get("task"),
                    val_split=validation_split,
                    test_split=0.15,
                    random_state=int(hyperparameters.get("random_seed", 42) or 42),
                )
            finally:
                if downloaded_dataset:
                    Path(csv_path).unlink(missing_ok=True)
            logger.info(
                "Dataset preparado: %s filas, %s características, tarea=%s",
                data.samples,
                data.input_dim,
                data.task,
            )

            model = KerasModelBuilder.build_model(
                config=architecture.get("config_json") or {},
                family=architecture.get("family") or "",
                input_dim=data.input_dim,
                output_units=data.output_units,
                output_activation=data.output_activation,
                loss=data.loss,
                metrics=data.metrics,
                hyperparameters=hyperparameters,
            )

            total_epochs = int(hyperparameters.get("epochs", 30) or 30)
            model.summary(print_fn=lambda line: logger.debug(line))

            db.set_job_status(job_id, "RUNNING", progress=1.0)
            self.publisher.state(job_id, "RUNNING", progress=1.0)

            def on_epoch(epoch: int, metrics: Dict[str, float]) -> None:
                progress = min(99.0, round((epoch / max(1, total_epochs)) * 100.0, 2))
                try:
                    db.insert_metrics(job_id, epoch, metrics)
                    db.update_job(job_id, progress=progress)
                except Exception:
                    logger.warning("No fue posible persistir métricas de la época %s", epoch, exc_info=True)
                self.publisher.epoch(job_id, epoch, total_epochs, metrics, progress)

            outcome = train_model(
                model,
                X_train=data.X_train,
                y_train=data.y_train,
                X_val=data.X_val,
                y_val=data.y_val,
                hyperparameters=hyperparameters,
                on_epoch=on_epoch,
                check_cancel=lambda: self._check_cancel(job_id),
            )

            if outcome.status == "CANCELLED":
                logger.info("Trabajo %s cancelado en la época %s", job_id, outcome.epochs_completed)
                self._finish_cancelled(job_id, outcome.epochs_completed / max(1, total_epochs) * 100.0)
                return "CANCELLED"

            if outcome.status == "TIMEOUT":
                message = "El entrenamiento excedió el tiempo máximo configurado"
                db.set_job_status(job_id, "FAILED", progress=min(99.0, outcome.epochs_completed / max(1, total_epochs) * 100.0), error_message=message, ended_at=_now())
                self.publisher.state(job_id, "FAILED", progress=0.0, error_message=message)
                return "FAILED"

            logger.info("Trabajo %s: evaluando modelo final", job_id)
            evaluation = ModelEvaluator.evaluate(model, data)
            artifacts = ArtifactStorageManager.save_model_artifact(
                model=model,
                data=data,
                project_id=project_id,
                job_id=job_id,
                hyperparameters=hyperparameters,
                dataset_checksum=dataset.get("checksum"),
                extra={"evaluation": evaluation, "epochs_completed": outcome.epochs_completed},
            )

            metrics_summary = {
                **evaluation,
                "epochs_completed": outcome.epochs_completed,
                "dataset_checksum": dataset.get("checksum"),
                "dataset_version": dataset.get("version"),
                "code_version": hyperparameters.get("code_version", "1.0.0"),
                "artifacts": artifacts["artifacts"],
                "class_labels": data.class_labels,
            }
            model_version = db.create_model_version(
                project_id=project_id,
                job_id=job_id,
                storage_key=artifacts["storage_key"],
                checksum=artifacts["checksum"],
                metrics_summary=metrics_summary,
            )
            db.set_job_status(job_id, "COMPLETED", progress=100.0, ended_at=_now(), error_message="")
            try:
                db.record_audit(
                    actor_id=(job or {}).get("requested_by"),
                    project_id=project_id,
                    action="TRAINING_JOB_COMPLETED",
                    metadata_payload={
                        "job_id": str(job_id),
                        "model_version_id": str(model_version["id"]),
                        "model_version": model_version["version"],
                        "checksum": artifacts["checksum"],
                        "metrics": {
                            key: value
                            for key, value in evaluation.items()
                            if isinstance(value, (int, float))
                        },
                    },
                )
            except Exception:
                logger.debug("No fue posible registrar auditoría de finalización", exc_info=True)

            self.publisher.state(
                job_id,
                "COMPLETED",
                progress=100.0,
                metrics_history=db.metric_history(job_id),
            )
            logger.info(
                "==> Trabajo %s COMPLETED. Versión %s checksum=%s",
                job_id,
                model_version["version"],
                artifacts["checksum"][:12],
            )
            return "COMPLETED"

        except (DataPreparationError, ModelBuildError, ArtifactStorageError) as exc:
            logger.error("Trabajo %s falló por validación: %s", job_id, exc)
            self._mark_failed(job_id, str(exc), project_id)
            return "FAILED"
        except Exception as exc:  # error inesperado de entrenamiento
            logger.error("Trabajo %s falló: %s", job_id, exc)
            logger.debug(traceback.format_exc())
            self._mark_failed(
                job_id,
                f"Error de entrenamiento ({type(exc).__name__}): {exc}",
                project_id,
            )
            return "FAILED"

    def _mark_failed(self, job_id: UUID, message: str, project_id: UUID) -> None:
        try:
            db.set_job_status(job_id, "FAILED", error_message=message, ended_at=_now())
            job = db.get_job(job_id) or {}
            db.record_audit(
                actor_id=job.get("requested_by"),
                project_id=project_id,
                action="TRAINING_JOB_FAILED",
                metadata_payload={"job_id": str(job_id), "error": message[:2000]},
            )
        except Exception:
            logger.debug("No fue posible persistir el fallo del trabajo", exc_info=True)
        self.publisher.state(job_id, "FAILED", error_message=message, metrics_history=db.metric_history(job_id))

    # ------------------------------------------------------------------
    # Colas
    # ------------------------------------------------------------------
    def _connect_redis(self):
        try:
            import redis

            client = redis.Redis.from_url(REDIS_URL, decode_responses=True)
            client.ping()
            self.redis_client = client
            logger.info("Worker conectado a Redis (%s), cola=%s", REDIS_URL, TRAINING_QUEUE)
            return client
        except Exception as exc:
            logger.warning("Redis no disponible (%s). Reintentando...", exc)
            self.redis_client = None
            return None

    def _recover_processing(self) -> None:
        for path in Path(PROCESSING_DIR).glob("*.json"):
            target = Path(QUEUE_DIR) / path.name
            try:
                os.replace(path, target)
                logger.info("Trabajo recuperado de procesamiento incompleto: %s", target.name)
            except OSError:
                logger.warning("No fue posible recuperar %s", path, exc_info=True)

    def _next_filesystem_job(self) -> Optional[Dict[str, Any]]:
        candidates = sorted(Path(QUEUE_DIR).glob("*.json"))
        if not candidates:
            return None
        path = candidates[0]
        claimed = Path(PROCESSING_DIR) / path.name
        try:
            os.replace(path, claimed)
        except OSError:
            return None
        try:
            payload = json.loads(claimed.read_text(encoding="utf-8"))
        except Exception:
            logger.error("Payload de cola inválido: %s", claimed, exc_info=True)
            claimed.unlink(missing_ok=True)
            return None
        payload["_queue_file"] = str(claimed)
        return payload

    def _ack_filesystem(self, payload: Dict[str, Any]) -> None:
        path = payload.get("_queue_file")
        if path:
            try:
                Path(path).unlink(missing_ok=True)
            except OSError:
                pass

    def run_once(self) -> bool:
        if QUEUE_BACKEND == "filesystem":
            payload = self._next_filesystem_job()
            if not payload:
                return False
            try:
                self.execute_job(payload)
            finally:
                self._ack_filesystem(payload)
            return True

        if self.redis_client is None and self._connect_redis() is None:
            return False
        try:
            item = self.redis_client.blpop(TRAINING_QUEUE, timeout=5)
        except Exception as exc:
            logger.warning("Error leyendo la cola Redis: %s", exc)
            self.redis_client = None
            return False
        if not item:
            return False
        _, raw = item
        payload = json.loads(raw)
        self.execute_job(payload)
        return True

    def run_forever(self) -> None:
        logger.info(
            "NeuroLab Training Worker activo (backend=%s, data=%s, models=%s)",
            QUEUE_BACKEND,
            DATA_DIR,
            MODEL_DIR,
        )
        if QUEUE_BACKEND == "filesystem":
            self._recover_processing()
        while not self._stopping:
            try:
                processed = self.run_once()
                if not processed:
                    time.sleep(QUEUE_POLL_SECONDS)
            except KeyboardInterrupt:
                break
            except Exception:
                logger.error("Error en el bucle del worker", exc_info=True)
                time.sleep(QUEUE_POLL_SECONDS)

    def stop(self, *_args) -> None:
        self._stopping = True


def _parse_args(argv: Optional[list] = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Worker de entrenamiento NeuroLab")
    parser.add_argument("--once", action="store_true", help="Procesa un trabajo y finaliza")
    parser.add_argument("--job-id", help="Ejecuta un trabajo concreto reconstruido desde la base de datos")
    parser.add_argument("--payload", help="Ruta a un payload JSON (pruebas/operación)")
    return parser.parse_args(argv)


def main(argv: Optional[list] = None) -> int:
    args = _parse_args(argv)
    daemon = TrainingWorkerDaemon()
    signal.signal(signal.SIGTERM, daemon.stop)
    if hasattr(signal, "SIGINT"):
        signal.signal(signal.SIGINT, daemon.stop)

    if args.payload:
        payload = json.loads(Path(args.payload).read_text(encoding="utf-8"))
        status = daemon.execute_job(payload)
        return 0 if status in {"COMPLETED", "CANCELLED"} else 1

    if args.job_id:
        try:
            job_id = UUID(args.job_id)
        except ValueError:
            logger.error("job-id inválido: %s", args.job_id)
            return 2
        payload = db.get_job_bundle(job_id)
        if not payload:
            logger.error("No se encontró el trabajo %s en la base de datos", job_id)
            return 2
        status = daemon.execute_job(payload)
        return 0 if status in {"COMPLETED", "CANCELLED"} else 1

    if args.once:
        processed = daemon.run_once()
        if not processed:
            logger.info("No hay trabajos pendientes")
        return 0

    daemon.run_forever()
    return 0


if __name__ == "__main__":
    sys.exit(main())
