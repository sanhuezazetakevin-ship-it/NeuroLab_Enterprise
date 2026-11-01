from typing import List, Tuple, Optional
from app.schemas.architecture import NetworkTopology, LayerConfig, ArchitectureValidationResult

class ArchitectureValidator:
    """
    Motor de validación matemática y dimensional de tensores para arquitecturas de redes neuronales.
    Garantiza que la topología sea compatible antes de compilar con TensorFlow/Keras.
    """

    @staticmethod
    def validate_topology(topology: NetworkTopology, family: str) -> ArchitectureValidationResult:
        errors: List[str] = []
        warnings: List[str] = []
        
        current_shape = list(topology.input_shape)
        total_params = 0
        trainable_params = 0

        if not topology.layers:
            return ArchitectureValidationResult(
                valid=False,
                total_parameters=0,
                trainable_parameters=0,
                output_shape=[],
                errors=["La arquitectura debe contener al menos una capa."]
            )

        if not topology.input_shape or any(dim <= 0 for dim in topology.input_shape):
            return ArchitectureValidationResult(
                valid=False,
                total_parameters=0,
                trainable_parameters=0,
                output_shape=[],
                errors=["El input_shape debe contener dimensiones positivas válidas."]
            )

        for idx, layer in enumerate(topology.layers):
            l_type = layer.type.strip()

            if l_type == "Dense":
                if not layer.units or layer.units <= 0:
                    errors.append(f"Capa {idx} (Dense): Las unidades deben ser > 0.")
                    continue
                
                # Denselayer params = (input_features + 1 bias) * units
                input_features = current_shape[-1]
                layer_params = (input_features + 1) * layer.units
                total_params += layer_params
                trainable_params += layer_params
                current_shape = [layer.units]

            elif l_type == "Dropout":
                rate = layer.rate if layer.rate is not None else 0.5
                if not (0.0 <= rate < 1.0):
                    errors.append(f"Capa {idx} (Dropout): La tasa debe estar entre 0.0 y 0.99.")
                # Dropout does not alter shape or parameters

            elif l_type == "Conv2D":
                if family not in ["CNN", "GAN"]:
                    warnings.append(f"Capa {idx} (Conv2D): Conv2D se utiliza principalmente en familias CNN y GAN.")
                if len(current_shape) < 3:
                    errors.append(f"Capa {idx} (Conv2D): Requiere un tensor de entrada de 3 dimensiones [H, W, C]. Actual: {current_shape}")
                    continue
                
                filters = layer.filters or 32
                k_size = layer.kernel_size or [3, 3]
                in_channels = current_shape[2]
                
                # Conv2D params = (k_w * k_h * in_channels + 1) * filters
                conv_params = (k_size[0] * k_size[1] * in_channels + 1) * filters
                total_params += conv_params
                trainable_params += conv_params

                # Simplified valid output height/width calculation
                h_out = max(1, current_shape[0] - k_size[0] + 1)
                w_out = max(1, current_shape[1] - k_size[1] + 1)
                current_shape = [h_out, w_out, filters]

            elif l_type == "MaxPooling2D":
                if len(current_shape) < 3:
                    errors.append(f"Capa {idx} (MaxPooling2D): Requiere un tensor 3D.")
                    continue
                p_size = layer.pool_size or [2, 2]
                current_shape = [
                    max(1, current_shape[0] // p_size[0]),
                    max(1, current_shape[1] // p_size[1]),
                    current_shape[2]
                ]

            elif l_type == "Flatten":
                # Multiplies all dimensions into a flat vector
                prod = 1
                for dim in current_shape:
                    prod *= dim
                current_shape = [prod]

            elif l_type in ["LSTM", "GRU"]:
                if family != "RNN":
                    warnings.append(f"Capa {idx} ({l_type}): Diseñada para secuencias temporales (familia RNN).")
                units = layer.units or 64
                in_dim = current_shape[-1]
                
                # Approximate LSTM params: 4 * ((in_dim + units) * units + units)
                factor = 4 if l_type == "LSTM" else 3
                rec_params = factor * ((in_dim + units) * units + units)
                total_params += rec_params
                trainable_params += rec_params

                if layer.return_sequences:
                    current_shape = [current_shape[0], units]
                else:
                    current_shape = [units]

            elif l_type == "BatchNormalization":
                num_features = current_shape[-1]
                bn_params = num_features * 4
                total_params += bn_params
                trainable_params += num_features * 2 # 2 trainable, 2 non-trainable

            else:
                errors.append(f"Capa {idx}: Tipo de capa '{l_type}' no soportado.")

        is_valid = len(errors) == 0

        return ArchitectureValidationResult(
            valid=is_valid,
            total_parameters=total_params,
            trainable_parameters=trainable_params,
            output_shape=[None] + current_shape,
            warnings=warnings,
            errors=errors
        )
