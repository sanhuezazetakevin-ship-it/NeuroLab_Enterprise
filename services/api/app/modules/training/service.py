import json
from uuid import UUID
import redis.asyncio as redis
from app.core.config import settings
from app.schemas.training import TrainingJobCreate

class TrainingOrchestrator:
    def __init__(self):
        self.redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)

    async def enqueue_training_job(
        self,
        job_id: UUID,
        project_id: UUID,
        architecture_id: UUID,
        dataset_id: UUID,
        hyperparameters: dict
    ) -> bool:
        """
        Encola un trabajo de entrenamiento en Redis para su consumo por el worker de TensorFlow/Keras.
        """
        payload = {
            "job_id": str(job_id),
            "project_id": str(project_id),
            "architecture_id": str(architecture_id),
            "dataset_id": str(dataset_id),
            "hyperparameters": hyperparameters,
            "status": "QUEUED"
        }
        
        # Publicar en cola principal
        await self.redis_client.rpush("neurolab:training:queue", json.dumps(payload))
        return True

    async def request_job_cancellation(self, job_id: UUID) -> bool:
        """
        Registra una bandera de cancelación cooperativa en Redis. El worker la verifica entre épocas.
        """
        key = f"neurolab:job:{job_id}:cancel"
        await self.redis_client.set(key, "1", ex=3600)
        # Notificar al canal pub/sub
        await self.redis_client.publish(f"neurolab:job:{job_id}:control", json.dumps({"action": "CANCEL"}))
        return True

training_orchestrator = TrainingOrchestrator()
