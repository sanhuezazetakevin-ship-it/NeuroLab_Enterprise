from typing import List, Optional

from app.schemas.architecture import ArchitectureValidationResult, NetworkTopology

FAMILIES = {"FEEDFORWARD", "RNN", "CNN", "GAN"}
LAYER_TYPES = {
    "Dense",
    "Dropout",
    "Conv2D",
    "MaxPooling2D",
    "Flatten",
    "LSTM",
    "GRU",
    "BatchNormalization",
}
FAMILY_LAYERS = {
    "FEEDFORWARD": {"Dense", "Dropout", "BatchNormalization"},
    "RNN": {"Dense", "Dropout", "BatchNormalization", "LSTM", "GRU"},
    "CNN": {"Dense", "Dropout", "BatchNormalization", "Conv2D", "MaxPooling2D", "Flatten"},
    # El generador de una GAN usa capas densas/convolucionales; el par
    # generador-discriminador se documenta pero su entrenamiento se habilita
    # progresivamente (ver criterio de finalización del MVP).
    "GAN": {"Dense", "Dropout", "BatchNormalization", "Conv2D", "MaxPooling2D", "Flatten"},
}


class ArchitectureValidator:
    """Validación dimensional y de compatibilidad por familia.

    El frontend nunca es la frontera de seguridad: esta validación se ejecuta
    tanto al guardar una arquitectura como al encolar un entrenamiento.
    """

    @staticmethod
    def validate_topology(topology: NetworkTopology, family: str) -> ArchitectureValidationResult:
        family = (family or "").upper()
        errors: List[str] = []
        warnings: List[str] = []

        if family not in FAMILIES:
            return ArchitectureValidationResult(
                valid=False,
                total_parameters=0,
                trainable_parameters=0,
                output_shape=[],
                errors=[f"Familia de red no soportada: '{family}'. Use {sorted(FAMILIES)}."],
                trainable=False,
                trainable_reason="Familia desconocida",
            )

        if not topology.input_shape or any(dim <= 0 for dim in topology.input_shape):
            return ArchitectureValidationResult(
                valid=False,
                total_parameters=0,
                trainable_parameters=0,
                output_shape=[],
                errors=["El input_shape debe contener dimensiones positivas válidas."],
                trainable=False,
                trainable_reason="Forma de entrada inválida",
            )

        if not topology.layers:
            return ArchitectureValidationResult(
                valid=False,
                total_parameters=0,
                trainable_parameters=0,
                output_shape=[],
                errors=["La arquitectura debe contener al menos una capa."],
                trainable=False,
                trainable_reason="Arquitectura vacía",
            )

        if family == "FEEDFORWARD" and len(topology.input_shape) != 1:
            errors.append(
                f"FEEDFORWARD espera un vector 1D de características. Recibido: {topology.input_shape}."
            )
        if family == "RNN" and len(topology.input_shape) != 2:
            errors.append(
                f"RNN espera [timesteps, features]. Recibido: {topology.input_shape}."
            )
        if family == "CNN" and len(topology.input_shape) != 3:
            errors.append(
                f"CNN espera [alto, ancho, canales]. Recibido: {topology.input_shape}."
            )

        current_shape = list(topology.input_shape)
        total_params = 0
        trainable_params = 0
        has_recurrent = False

        for idx, layer in enumerate(topology.layers):
            l_type = layer.type.strip()
            if l_type not in LAYER_TYPES:
                errors.append(f"Capa {idx}: tipo de capa '{l_type}' no soportado.")
                continue
            if l_type not in FAMILY_LAYERS[family]:
                errors.append(
                    f"Capa {idx} ({l_type}): incompatible con la familia {family}."
                )
                continue

            if l_type == "Dense":
                if not layer.units or layer.units <= 0:
                    errors.append(f"Capa {idx} (Dense): las unidades deben ser > 0.")
                    continue
                if len(current_shape) > 1:
                    errors.append(
                        f"Capa {idx} (Dense): requiere entrada 2D; agregue Flatten/GlobalPooling antes "
                        f"(forma actual {current_shape})."
                    )
                    continue

                input_features = current_shape[-1]
                layer_params = (input_features + 1) * layer.units
                total_params += layer_params
                trainable_params += layer_params
                current_shape = [layer.units]

            elif l_type == "Dropout":
                rate = layer.rate if layer.rate is not None else 0.5
                if not (0.0 <= rate < 1.0):
                    errors.append(f"Capa {idx} (Dropout): la tasa debe estar en [0, 1).")

            elif l_type == "Conv2D":
                if len(current_shape) != 3:
                    errors.append(
                        f"Capa {idx} (Conv2D): requiere tensor [H, W, C]. Actual: {current_shape}."
                    )
                    continue
                filters = layer.filters or 32
                k_size = layer.kernel_size or [3, 3]
                if len(k_size) != 2 or any(k <= 0 for k in k_size):
                    errors.append(f"Capa {idx} (Conv2D): kernel_size inválido.")
                    continue
                in_channels = current_shape[2]
                conv_params = (k_size[0] * k_size[1] * in_channels + 1) * filters
                total_params += conv_params
                trainable_params += conv_params
                current_shape = [
                    current_shape[0] - k_size[0] + 1,
                    current_shape[1] - k_size[1] + 1,
                    filters,
                ]
                if current_shape[0] < 1 or current_shape[1] < 1:
                    errors.append(
                        f"Capa {idx} (Conv2D): el kernel {k_size} es mayor que la entrada; "
                        "la salida quedaría vacía."
                    )
                    current_shape = [1, 1, filters]

            elif l_type == "MaxPooling2D":
                if len(current_shape) != 3:
                    errors.append(f"Capa {idx} (MaxPooling2D): requiere un tensor [H, W, C].")
                    continue
                p_size = layer.pool_size or [2, 2]
                if len(p_size) != 2 or any(p <= 0 for p in p_size):
                    errors.append(f"Capa {idx} (MaxPooling2D): pool_size inválido.")
                    continue
                current_shape = [
                    max(1, current_shape[0] // p_size[0]),
                    max(1, current_shape[1] // p_size[1]),
                    current_shape[2],
                ]

            elif l_type == "Flatten":
                prod = 1
                for dim in current_shape:
                    prod *= int(dim)
                current_shape = [prod]

            elif l_type in {"LSTM", "GRU"}:
                units = layer.units or 64
                if units <= 0:
                    errors.append(f"Capa {idx} ({l_type}): units debe ser > 0.")
                    continue
                in_dim = current_shape[-1]
                factor = 4 if l_type == "LSTM" else 3
                rec_params = factor * ((in_dim + units) * units + units)
                total_params += rec_params
                trainable_params += rec_params
                has_recurrent = True
                if layer.return_sequences:
                    current_shape = [current_shape[0], units]
                else:
                    current_shape = [units]

            elif l_type == "BatchNormalization":
                if len(current_shape) != 1:
                    errors.append(
                        f"Capa {idx} (BatchNormalization): requiere entrada 2D; actual {current_shape}."
                    )
                    continue
                num_features = current_shape[-1]
                total_params += num_features * 4
                trainable_params += num_features * 2

        # La última capa debe producir la salida del modelo.
        if topology.layers:
            last = topology.layers[-1]
            if last.type.strip() != "Dense":
                errors.append(
                    "La última capa debe ser Dense para definir la salida del modelo "
                    "(clasificación o regresión)."
                )
            elif last.type.strip() in FAMILY_LAYERS[family] and last.units:
                expected_activation = (last.activation or "").lower()
                if family in {"FEEDFORWARD", "CNN", "RNN"}:
                    if expected_activation in {"sigmoid", "softmax", "linear"}:
                        pass  # válido; la compatibilidad exacta se comprueba contra el dataset
                    else:
                        warnings.append(
                            "La capa de salida debería usar sigmoid/softmax (clasificación) "
                            "o linear (regresión)."
                        )
        if family == "RNN" and not has_recurrent:
            errors.append("La familia RNN requiere al menos una capa LSTM/GRU.")
        if family == "CNN" and not any(
            layer.type.strip() in {"Conv2D", "MaxPooling2D"} for layer in topology.layers
        ):
            errors.append("La familia CNN requiere al menos una capa Conv2D o MaxPooling2D.")

        is_valid = len(errors) == 0
        trainable = is_valid
        trainable_reason: Optional[str] = None
        if family == "GAN":
            trainable = False
            trainable_reason = (
                "GAN documentada en el catálogo; su entrenamiento adversarial se habilitará "
                "en una fase posterior (MVP: Feedforward)."
            )
        elif family == "CNN":
            trainable = False
            trainable_reason = (
                "CNN requiere datasets de imagen/volumen; la ingesta CSV tabular del MVP "
                "sólo admite Feedforward."
            )
        elif family == "RNN":
            trainable = False
            trainable_reason = (
                "RNN requiere datasets secuenciales; la ingesta CSV tabular del MVP "
                "sólo admite Feedforward."
            )

        return ArchitectureValidationResult(
            valid=is_valid,
            total_parameters=total_params,
            trainable_parameters=trainable_params,
            output_shape=[None] + current_shape,
            warnings=warnings,
            errors=errors,
            trainable=trainable,
            trainable_reason=trainable_reason,
        )
