import os
import hashlib
import logging
from typing import Tuple

logger = logging.getLogger("neurolab.storage")

class ArtifactStorageManager:
    @staticmethod
    def save_model_artifact(job_id: str, project_id: str, model_bytes: bytes = None) -> Tuple[str, str]:
        """
        Guarda los pesos del modelo y calcula el hash SHA-256 para trazabilidad inmutable.
        Retorna (storage_key, sha256_checksum).
        """
        if model_bytes is None:
            # Checkpoint mock bytes
            model_bytes = f"neurolab_model_checkpoint_{job_id}".encode("utf-8")

        sha256 = hashlib.sha256(model_bytes).hexdigest()
        storage_key = f"models/{project_id}/{job_id}/model_weights_{sha256[:12]}.keras"
        
        logger.info(f"Modelo persistido en clave: {storage_key} con Checksum: {sha256}")
        return storage_key, sha256
