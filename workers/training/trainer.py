import time
import json
import logging
from typing import Dict, Any, Callable, Optional

logger = logging.getLogger("neurolab.trainer")

class RealtimeTelemetryCallback:
    """
    Callback de Keras que reporta el progreso de época a Redis Pub/Sub
    y comprueba si el usuario solicitó la cancelación cooperativa.
    """
    def __init__(
        self,
        job_id: str,
        total_epochs: int,
        emit_fn: Callable[[Dict[str, Any]], None],
        check_cancel_fn: Callable[[], bool]
    ):
        self.job_id = job_id
        self.total_epochs = total_epochs
        self.emit_fn = emit_fn
        self.check_cancel_fn = check_cancel_fn
        self.stopped = False

    def on_epoch_end(self, epoch: int, logs: Dict[str, float] = None):
        logs = logs or {}
        progress = round(((epoch + 1) / self.total_epochs) * 100.0, 2)
        
        telemetry_event = {
            "event": "epoch_end",
            "job_id": self.job_id,
            "epoch": epoch + 1,
            "total_epochs": self.total_epochs,
            "progress": progress,
            "metrics": {
                k: round(float(v), 5) for k, v in logs.items()
            }
        }
        
        # Emisión de telemetría a Redis / WebSocket
        self.emit_fn(telemetry_event)

        # Verificación de cancelación cooperativa
        if self.check_cancel_fn():
            logger.info(f"Cancelación cooperativa recibida para trabajo {self.job_id} en época {epoch + 1}.")
            self.stopped = True
            return True
        return False

def simulate_training_run(job_id: str, epochs: int, emit_fn: Callable, check_cancel_fn: Callable) -> str:
    """
    Ejecutor de respaldo para entornos de desarrollo livianos.
    Simula convergencia real de pérdida y exactitud con tiempos reales.
    """
    import random
    loss = 0.850
    accuracy = 0.520
    val_loss = 0.890
    val_accuracy = 0.510

    for epoch in range(1, epochs + 1):
        if check_cancel_fn():
            logger.info(f"Trabajo {job_id} cancelado en época {epoch}")
            return "CANCELLED"

        time.sleep(0.5) # Simular cómputo por época

        loss = max(0.05, loss * 0.93 - random.uniform(-0.01, 0.02))
        accuracy = min(0.985, accuracy + (1.0 - accuracy) * 0.08 + random.uniform(-0.01, 0.015))
        val_loss = max(0.08, val_loss * 0.94 - random.uniform(-0.015, 0.025))
        val_accuracy = min(0.975, val_accuracy + (1.0 - val_accuracy) * 0.07 + random.uniform(-0.015, 0.015))

        progress = round((epoch / epochs) * 100.0, 2)
        event = {
            "event": "epoch_end",
            "job_id": job_id,
            "epoch": epoch,
            "total_epochs": epochs,
            "progress": progress,
            "metrics": {
                "loss": round(loss, 4),
                "accuracy": round(accuracy, 4),
                "val_loss": round(val_loss, 4),
                "val_accuracy": round(val_accuracy, 4)
            }
        }
        emit_fn(event)

    return "COMPLETED"
