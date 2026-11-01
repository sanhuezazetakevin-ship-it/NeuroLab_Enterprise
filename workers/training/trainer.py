"""Entrenamiento real con callbacks de telemetría y cancelación cooperativa."""

from __future__ import annotations

import logging
import time
from dataclasses import dataclass
from typing import Any, Callable, Dict, List

import numpy as np
import tensorflow as tf

logger = logging.getLogger("neurolab.trainer")


@dataclass
class TrainingOutcome:
    status: str
    epochs_completed: int
    history: Dict[str, List[float]]


class TelemetryCallback(tf.keras.callbacks.Callback):
    """Callback de Keras que persiste métricas y evalúa cancelación.

    La cancelación se comprueba al inicio y al final de cada época
    (cooperativa). Si se solicita, se detiene el entrenamiento sin destruir el
    proceso: el worker marca el trabajo como CANCELLED y conserva las métricas
    ya registradas.
    """

    def __init__(
        self,
        *,
        total_epochs: int,
        on_epoch: Callable[[int, Dict[str, float]], None],
        check_cancel: Callable[[], bool],
        timeout_seconds: int = 7200,
    ):
        super().__init__()
        self.total_epochs = max(1, int(total_epochs))
        self.on_epoch = on_epoch
        self.check_cancel = check_cancel
        self.timeout_seconds = int(timeout_seconds)
        self.cancelled = False
        self.timed_out = False
        self.epochs_completed = 0
        self._started = time.monotonic()

    def _should_stop(self) -> bool:
        if self.check_cancel():
            self.cancelled = True
            self.model.stop_training = True
            return True
        if self.timeout_seconds > 0 and (time.monotonic() - self._started) > self.timeout_seconds:
            self.timed_out = True
            self.model.stop_training = True
            return True
        return False

    def on_epoch_begin(self, epoch, logs=None):
        self._should_stop()

    def on_epoch_end(self, epoch, logs=None):
        logs = logs or {}
        self.epochs_completed = int(epoch) + 1
        clean_metrics: Dict[str, float] = {}
        for key, value in logs.items():
            try:
                clean_metrics[str(key)] = float(value)
            except (TypeError, ValueError):
                continue
        self.on_epoch(self.epochs_completed, clean_metrics)
        self._should_stop()


def train_model(
    model,
    *,
    X_train: np.ndarray,
    y_train: np.ndarray,
    X_val: np.ndarray,
    y_val: np.ndarray,
    hyperparameters: Dict[str, Any],
    on_epoch: Callable[[int, Dict[str, float]], None],
    check_cancel: Callable[[], bool],
) -> TrainingOutcome:
    epochs = int(hyperparameters.get("epochs", 30) or 30)
    batch_size = int(hyperparameters.get("batch_size", 32) or 32)

    callback = TelemetryCallback(
        total_epochs=epochs,
        on_epoch=on_epoch,
        check_cancel=check_cancel,
        timeout_seconds=int(hyperparameters.get("timeout_seconds", 7200) or 7200),
    )
    callbacks: List[Any] = [callback]

    if hyperparameters.get("early_stopping", False):
        callbacks.append(
            tf.keras.callbacks.EarlyStopping(
                monitor="val_loss",
                patience=int(hyperparameters.get("early_stopping_patience", 10) or 10),
                restore_best_weights=True,
                min_delta=1e-4,
            )
        )
    callbacks.append(tf.keras.callbacks.TerminateOnNaN())

    if check_cancel():
        return TrainingOutcome(status="CANCELLED", epochs_completed=0, history={})

    history = model.fit(
        X_train,
        y_train,
        validation_data=(X_val, y_val),
        epochs=epochs,
        batch_size=max(1, batch_size),
        verbose=0,
        shuffle=True,
        callbacks=callbacks,
    )

    if callback.cancelled:
        status = "CANCELLED"
    elif callback.timed_out:
        status = "TIMEOUT"
    else:
        status = "COMPLETED"

    logger.info(
        "Entrenamiento finalizado con estado=%s tras %s épocas",
        status,
        callback.epochs_completed,
    )
    return TrainingOutcome(
        status=status,
        epochs_completed=callback.epochs_completed,
        history={key: [float(value) for value in values] for key, values in (history.history or {}).items()},
    )
