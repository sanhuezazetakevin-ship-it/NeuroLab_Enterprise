"""Construcción de modelos Keras a partir de la topología validada por la API."""

from __future__ import annotations

import logging
from typing import Any, Dict, List, Optional

logger = logging.getLogger("neurolab.builder")


class ModelBuildError(ValueError):
    """Error de construcción con un mensaje apto para el usuario."""


class KerasModelBuilder:
    """Construye un modelo Feedforward real para el MVP tabular.

    La capa de salida se adapta automáticamente al tipo de tarea detectado en
    el dataset (binaria, multiclase o regresión). Esto evita incongruencias
    entre la topología guardada y las etiquetas reales.
    """

    @staticmethod
    def build_model(
        *,
        config: Dict[str, Any],
        family: str,
        input_dim: int,
        output_units: int,
        output_activation: str,
        loss: str,
        metrics: List[str],
        hyperparameters: Dict[str, Any],
    ):
        try:
            import tensorflow as tf
            from tensorflow.keras import layers, models, optimizers
        except ImportError as exc:  # pragma: no cover - entorno sin TF
            raise ModelBuildError(
                "TensorFlow/Keras no está disponible en el worker. Instale las dependencias de entrenamiento."
            ) from exc

        family_upper = (family or "FEEDFORWARD").upper()
        if family_upper != "FEEDFORWARD":
            raise ModelBuildError(
                f"La familia {family_upper or 'desconocida'} no está habilitada para entrenamiento con datos tabulares. "
                "Familia soportada: FEEDFORWARD."
            )

        configured_shape = config.get("input_shape")
        if configured_shape is not None:
            try:
                normalized_shape = tuple(int(dimension) for dimension in configured_shape)
            except (TypeError, ValueError) as exc:
                raise ModelBuildError("La forma de entrada configurada no es válida") from exc
            if normalized_shape != (int(input_dim),):
                raise ModelBuildError(
                    f"La forma de entrada configurada {normalized_shape} no coincide con input_dim={input_dim}"
                )

        raw_seed = hyperparameters.get("random_seed")
        seed = 42 if raw_seed is None else int(raw_seed)
        tf.keras.utils.set_random_seed(seed)

        raw_layers = config.get("layers", [])
        if not raw_layers:
            raise ModelBuildError("La arquitectura no contiene capas")

        model_name = f"neurolab_{family_upper.lower()}"
        model = models.Sequential(name=model_name)
        model.add(layers.Input(shape=(input_dim,), name="features"))

        last_index = len(raw_layers) - 1
        output_defined = False
        for index, layer_config in enumerate(raw_layers):
            layer_type = str(layer_config.get("type", "")).strip()
            activation = str(layer_config.get("activation") or "relu").lower()
            is_last = index == last_index

            if layer_type == "Dense":
                units = int(output_units) if is_last else int(layer_config.get("units") or 32)
                if units <= 0:
                    raise ModelBuildError(f"Capa {index}: las unidades de Dense deben ser mayores que cero")
                use_activation: Optional[str] = output_activation if is_last else activation
                if use_activation == "leaky_relu":
                    model.add(layers.Dense(units=units, activation=None, name=f"dense_{index}"))
                    model.add(layers.LeakyReLU(negative_slope=0.01))
                else:
                    model.add(layers.Dense(units=units, activation=use_activation, name=f"dense_{index}"))
                if is_last:
                    output_defined = True

            elif layer_type in {"Conv1D", "Conv2D", "MaxPooling1D", "MaxPooling2D", "LSTM", "GRU", "SimpleRNN"}:
                raise ModelBuildError(
                    f"Capa {index}: {layer_type} no es compatible con el entrenamiento de datos tabulares"
                )

            elif layer_type == "Flatten":
                model.add(layers.Flatten(name=f"flatten_{index}"))

            elif layer_type == "Dropout":
                rate = float(layer_config.get("rate", 0.2) or 0.2)
                if not 0.0 <= rate < 1.0:
                    raise ModelBuildError(f"Capa {index}: la tasa de Dropout debe estar en [0, 1)")
                model.add(layers.Dropout(rate=rate, name=f"dropout_{index}"))

            elif layer_type == "BatchNormalization":
                model.add(layers.BatchNormalization(name=f"batchnorm_{index}"))

            else:
                raise ModelBuildError(
                    f"Capa {index}: tipo de capa '{layer_type}' no soportado para la familia {family_upper}"
                )

        if not output_defined:
            if output_activation == "leaky_relu":
                model.add(layers.Dense(units=int(output_units), activation=None, name="output"))
                model.add(layers.LeakyReLU(negative_slope=0.01))
            else:
                model.add(
                    layers.Dense(
                        units=int(output_units),
                        activation=output_activation,
                        name="output",
                    )
                )

        optimizer_name = str(hyperparameters.get("optimizer", "adam")).lower()
        learning_rate = float(hyperparameters.get("learning_rate", 0.001))
        optimizer_map = {
            "adam": optimizers.Adam,
            "sgd": optimizers.SGD,
            "rmsprop": optimizers.RMSprop,
        }
        optimizer_cls = optimizer_map.get(optimizer_name, optimizers.Adam)
        optimizer = optimizer_cls(learning_rate=learning_rate)

        model.compile(optimizer=optimizer, loss=loss, metrics=list(metrics))
        logger.info(
            "Modelo Keras compilado: %s parámetros, salida=%s/%s, pérdida=%s",
            model.count_params(),
            output_units,
            output_activation,
            loss,
        )
        return model
