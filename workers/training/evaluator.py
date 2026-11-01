"""Evaluación final real sobre el conjunto de prueba reservado."""

from __future__ import annotations

import logging
from typing import Any, Dict

import numpy as np
from sklearn.metrics import (
    accuracy_score,
    confusion_matrix,
    f1_score,
    mean_absolute_error,
    mean_squared_error,
    precision_score,
    r2_score,
    recall_score,
)

from preprocessing import PreparedDataset

logger = logging.getLogger("neurolab.evaluator")


class ModelEvaluator:
    @staticmethod
    def evaluate(model, data: PreparedDataset) -> Dict[str, Any]:
        logger.info("Ejecutando evaluación final sobre %s muestras de prueba", data.samples_test)
        raw = model.evaluate(data.X_test, data.y_test, verbose=0, return_dict=True)
        metrics: Dict[str, Any] = {
            "test_loss": float(raw.get("loss", 0.0)),
            "samples_test": int(data.samples_test),
            "task": data.task,
        }

        if data.task == "classification":
            probabilities = model.predict(data.X_test, verbose=0)
            if data.output_units == 1:
                predictions = (np.asarray(probabilities).reshape(-1) >= 0.5).astype(int)
                average = "binary"
            else:
                predictions = np.argmax(probabilities, axis=1)
                average = "weighted"

            labels = list(range(len(data.class_labels)))
            metrics.update(
                {
                    "test_accuracy": float(accuracy_score(data.y_test, predictions)),
                    "accuracy": float(accuracy_score(data.y_test, predictions)),
                    "precision": float(
                        precision_score(data.y_test, predictions, average=average, zero_division=0)
                    ),
                    "recall": float(
                        recall_score(data.y_test, predictions, average=average, zero_division=0)
                    ),
                    "f1_score": float(
                        f1_score(data.y_test, predictions, average=average, zero_division=0)
                    ),
                    "confusion_matrix": confusion_matrix(
                        data.y_test, predictions, labels=labels
                    ).tolist(),
                    "class_labels": data.class_labels,
                }
            )
        else:
            predictions = np.asarray(model.predict(data.X_test, verbose=0)).reshape(-1)
            mse = float(mean_squared_error(data.y_test, predictions))
            metrics.update(
                {
                    "test_mse": mse,
                    "test_rmse": float(np.sqrt(mse)),
                    "test_mae": float(mean_absolute_error(data.y_test, predictions)),
                    "r2_score": float(r2_score(data.y_test, predictions)),
                }
            )
        return metrics
