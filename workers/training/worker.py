import os
import time
import json
import logging
from uuid import UUID
import redis
from builder import KerasModelBuilder
from trainer import simulate_training_run
from storage import ArtifactStorageManager
from evaluator import ModelEvaluator

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("neurolab.worker")

REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = int(os.getenv("REDIS_PORT", "6379"))

class TrainingWorkerDaemon:
    def __init__(self):
        self.redis_client = None
        self._connect_redis()

    def _connect_redis(self):
        try:
            self.redis_client = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, db=0, decode_responses=True)
            self.redis_client.ping()
            logger.info(f"Conectado exitosamente a Redis en {REDIS_HOST}:{REDIS_PORT}")
        except Exception as e:
            logger.warning(f"No se pudo conectar a Redis ({e}). Modo en espera.")
            self.redis_client = None

    def check_cancellation(self, job_id: str) -> bool:
        if not self.redis_client:
            return False
        try:
            return bool(self.redis_client.exists(f"neurolab:job:{job_id}:cancel"))
        except Exception:
            return False

    def emit_telemetry(self, job_id: str, event: dict):
        if self.redis_client:
            try:
                self.redis_client.publish(f"neurolab:job:{job_id}:telemetry", json.dumps(event))
            except Exception as e:
                logger.error(f"Error publicando telemetría: {e}")
        logger.info(f"Job {job_id} Época {event.get('epoch')}/{event.get('total_epochs')} | Loss: {event.get('metrics', {}).get('loss')} | Acc: {event.get('metrics', {}).get('accuracy')}")

    def execute_job(self, job_data: dict):
        job_id = job_data["job_id"]
        project_id = job_data["project_id"]
        hyperparameters = job_data.get("hyperparameters", {})
        epochs = hyperparameters.get("epochs", 20)

        logger.info(f"==> Iniciando trabajo {job_id} | Máquina de estados: PREPARING -> RUNNING")

        # 1. PREPARING
        time.sleep(1.0)

        # 2. RUNNING
        final_status = simulate_training_run(
            job_id=job_id,
            epochs=epochs,
            emit_fn=lambda evt: self.emit_telemetry(job_id, evt),
            check_cancel_fn=lambda: self.check_cancellation(job_id)
        )

        # 3. COMPLETED o CANCELLED
        if final_status == "COMPLETED":
            storage_key, checksum = ArtifactStorageManager.save_model_artifact(job_id, project_id)
            eval_metrics = ModelEvaluator.evaluate(None, None)
            logger.info(f"Trabajo {job_id} COMPLETADO con éxito. Checksum: {checksum}")
        else:
            logger.info(f"Trabajo {job_id} finalizó en estado: {final_status}")

    def run(self):
        logger.info("NeuroLab Training Worker activo y escuchando cola 'neurolab:training:queue'...")
        while True:
            try:
                if not self.redis_client:
                    time.sleep(5)
                    self._connect_redis()
                    continue

                item = self.redis_client.blpop("neurolab:training:queue", timeout=5)
                if item:
                    _, payload = item
                    job_data = json.loads(payload)
                    self.execute_job(job_data)
            except Exception as e:
                logger.error(f"Error en loop de worker: {e}")
                time.sleep(2)

if __name__ == "__main__":
    daemon = TrainingWorkerDaemon()
    daemon.run()
