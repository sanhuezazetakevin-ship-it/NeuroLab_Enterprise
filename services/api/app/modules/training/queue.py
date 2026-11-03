import asyncio
import json
import time
from pathlib import Path

from app.core.config import settings

try:
    import redis.asyncio as aioredis
except ModuleNotFoundError:  # pragma: no cover - entorno mínimo
    aioredis = None


class QueueUnavailableError(RuntimeError):
    pass


class TrainingQueue:
    """Cola de trabajos con backend Redis (producción) o filesystem (desarrollo).

    El backend filesystem mantiene el aislamiento del proceso de ML (la API sólo
    escribe un descriptor y un worker independiente lo consume). No se ejecuta
    TensorFlow dentro de la API en ningún modo.
    """

    def __init__(self) -> None:
        # Se lee de settings para que el .env de pydantic cuente igual que las
        # variables de entorno del contenedor. Antes os.getenv ignoraba el .env
        # y la API caía siempre en Redis aunque QUEUE_BACKEND=filesystem.
        self.backend = (settings.QUEUE_BACKEND or "redis").strip().lower()
        self.queue_dir = Path(settings.DATA_DIR) / "queue"
        self.cancel_dir = Path(settings.DATA_DIR) / "cancellations"
        self.queue_dir.mkdir(parents=True, exist_ok=True)
        self.cancel_dir.mkdir(parents=True, exist_ok=True)
        self._redis = None

    async def _client(self):
        if aioredis is None:
            return None
        if self._redis is None:
            self._redis = aioredis.from_url(settings.REDIS_URL, decode_responses=True)
        return self._redis

    async def enqueue(self, payload: dict) -> None:
        if self.backend == "filesystem":
            target = self.queue_dir / f"{int(time.time() * 1000)}-{payload['job_id']}.json"
            target.write_text(json.dumps(payload), encoding="utf-8")
            return

        client = await self._client()
        if client is None:
            raise QueueUnavailableError("Cliente Redis no disponible")
        try:
            await client.rpush(settings.TRAINING_QUEUE, json.dumps(payload))
        except Exception as exc:  # conexión rechazada, DNS, etc.
            raise QueueUnavailableError(
                "La cola de entrenamientos no está disponible. Verifique Redis."
            ) from exc

    async def request_cancel(self, job_id: str) -> None:
        if self.backend == "filesystem":
            (self.cancel_dir / f"{job_id}.flag").write_text("1", encoding="utf-8")
            return

        client = await self._client()
        if client is None:
            raise QueueUnavailableError("Cliente Redis no disponible")
        try:
            await client.set(f"neurolab:job:{job_id}:cancel", "1", ex=3600)
            await client.publish(
                f"neurolab:job:{job_id}:control", json.dumps({"action": "CANCEL"})
            )
        except Exception as exc:
            raise QueueUnavailableError(
                "No fue posible notificar la cancelación al worker."
            ) from exc

    async def close(self) -> None:
        if self._redis is not None:
            await self._redis.aclose()
            self._redis = None


training_queue = TrainingQueue()


async def redis_client():
    if aioredis is None:
        return None
    client = aioredis.from_url(settings.REDIS_URL, decode_responses=True)
    try:
        await asyncio.wait_for(client.ping(), timeout=1.0)
        return client
    except Exception:
        await client.aclose()
        return None
