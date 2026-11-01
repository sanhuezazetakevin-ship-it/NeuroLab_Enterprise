"""Persistencia de artefactos inmutables del modelo entrenado."""

from __future__ import annotations

import hashlib
import json
import logging
import pickle
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, Optional
from uuid import UUID

from worker_config import CODE_VERSION, MODEL_DIR
from preprocessing import PreparedDataset
from object_storage import ObjectStorageError, object_storage

logger = logging.getLogger("neurolab.storage")


class ArtifactStorageError(RuntimeError):
    pass


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


class ArtifactStorageManager:
    @staticmethod
    def artifact_directory(project_id: UUID, job_id: UUID) -> Path:
        directory = (Path(MODEL_DIR) / "models" / str(project_id) / str(job_id)).resolve()
        base = Path(MODEL_DIR).resolve()
        if base not in directory.parents:
            raise ArtifactStorageError("Ruta de artefactos fuera del almacenamiento permitido")
        directory.mkdir(parents=True, exist_ok=True)
        return directory

    @staticmethod
    def save_model_artifact(
        *,
        model,
        data: PreparedDataset,
        project_id: UUID,
        job_id: UUID,
        hyperparameters: Dict[str, Any],
        dataset_checksum: Optional[str],
        extra: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        directory = ArtifactStorageManager.artifact_directory(project_id, job_id)

        model_path = directory / "model.keras"
        try:
            model.save(model_path)
        except Exception as exc:  # pragma: no cover - depende de la versión de Keras
            raise ArtifactStorageError(f"No fue posible guardar el modelo .keras: {exc}") from exc

        scaler_path = directory / "scaler.pkl"
        with scaler_path.open("wb") as handle:
            pickle.dump(data.scaler_bundle(), handle, protocol=pickle.HIGHEST_PROTOCOL)

        preprocessor_path = directory / "preprocessor.pkl"
        with preprocessor_path.open("wb") as handle:
            pickle.dump(data.preprocessor, handle, protocol=pickle.HIGHEST_PROTOCOL)

        manifest = {
            "schema_version": 1,
            "code_version": CODE_VERSION,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "project_id": str(project_id),
            "job_id": str(job_id),
            "task": data.task,
            "target_column": data.target_column,
            "input_dim": data.input_dim,
            "output_units": data.output_units,
            "output_activation": data.output_activation,
            "loss": data.loss,
            "class_labels": data.class_labels,
            "feature_names": data.feature_names,
            "numeric_columns": data.numeric_columns,
            "categorical_columns": data.categorical_columns,
            "samples": {
                "total": data.samples,
                "train": data.samples_train,
                "validation": data.samples_val,
                "test": data.samples_test,
            },
            "hyperparameters": hyperparameters,
            "dataset_checksum": dataset_checksum,
            "artifacts": {
                "model": model_path.name,
                "scaler": scaler_path.name,
                "preprocessor": preprocessor_path.name,
            },
        }
        if extra:
            manifest.update(extra)
        manifest_path = directory / "training_manifest.json"
        manifest_path.write_text(json.dumps(manifest, indent=2, default=str), encoding="utf-8")

        model_checksum = sha256_file(model_path)
        scaler_checksum = sha256_file(scaler_path)
        preprocessor_checksum = sha256_file(preprocessor_path)
        manifest_checksum = sha256_file(manifest_path)

        relative_model = model_path.relative_to(Path(MODEL_DIR).resolve()).as_posix()
        relative_scaler = scaler_path.relative_to(Path(MODEL_DIR).resolve()).as_posix()
        relative_preprocessor = preprocessor_path.relative_to(Path(MODEL_DIR).resolve()).as_posix()
        relative_manifest = manifest_path.relative_to(Path(MODEL_DIR).resolve()).as_posix()

        # Si API y worker no comparten volumen, los artefactos deben subirse
        # al bucket para que el endpoint de descarga pueda servirlos.
        try:
            object_storage.put_file(model_path, relative_model, "application/octet-stream")
            object_storage.put_file(scaler_path, relative_scaler, "application/octet-stream")
            object_storage.put_file(
                preprocessor_path, relative_preprocessor, "application/octet-stream"
            )
            object_storage.put_file(
                manifest_path, relative_manifest, "application/json"
            )
        except ObjectStorageError as exc:
            raise ArtifactStorageError(
                f"No fue posible publicar los artefactos en el almacenamiento: {exc}"
            ) from exc
        logger.info("Artefactos guardados en %s (sha256=%s)", relative_model, model_checksum)

        return {
            "storage_key": relative_model,
            "checksum": model_checksum,
            "artifact_dir": str(directory),
            "artifacts": {
                "model": {"path": relative_model, "sha256": model_checksum},
                "scaler": {"path": relative_scaler, "sha256": scaler_checksum},
                "preprocessor": {
                    "path": preprocessor_path.relative_to(Path(MODEL_DIR).resolve()).as_posix(),
                    "sha256": preprocessor_checksum,
                },
                "manifest": {
                    "path": manifest_path.relative_to(Path(MODEL_DIR).resolve()).as_posix(),
                    "sha256": manifest_checksum,
                },
            },
            "manifest": manifest,
        }
