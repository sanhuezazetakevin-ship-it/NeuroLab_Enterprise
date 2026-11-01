import logging
from typing import Dict, Any

logger = logging.getLogger("neurolab.builder")

class KerasModelBuilder:
    """
    Construye dinámicamente modelos de TensorFlow/Keras a partir de especificaciones JSON validadas.
    Soporta familias Feedforward, RNN y CNN.
    """

    @staticmethod
    def build_model(config: Dict[str, Any], hyperparameters: Dict[str, Any]):
        try:
            import tensorflow as tf
            from tensorflow.keras import layers, models, optimizers, losses
        except ImportError:
            logger.warning("TensorFlow/Keras no está disponible en este entorno. Se utilizará simulación.")
            return None

        input_shape = tuple(config.get("input_shape", []))
        raw_layers = config.get("layers", [])

        model = models.Sequential()
        model.add(layers.Input(shape=input_shape))

        for idx, l in enumerate(raw_layers):
            l_type = l.get("type")
            activation = l.get("activation", "relu")

            if l_type == "Dense":
                units = l.get("units", 32)
                model.add(layers.Dense(units=units, activation=activation))

            elif l_type == "Dropout":
                rate = l.get("rate", 0.2)
                model.add(layers.Dropout(rate=rate))

            elif l_type == "Conv2D":
                filters = l.get("filters", 32)
                k_size = tuple(l.get("kernel_size", [3, 3]))
                model.add(layers.Conv2D(filters=filters, kernel_size=k_size, activation=activation))

            elif l_type == "MaxPooling2D":
                p_size = tuple(l.get("pool_size", [2, 2]))
                model.add(layers.MaxPooling2D(pool_size=p_size))

            elif l_type == "Flatten":
                model.add(layers.Flatten())

            elif l_type == "LSTM":
                units = l.get("units", 64)
                ret_seq = l.get("return_sequences", False)
                model.add(layers.LSTM(units=units, return_sequences=ret_seq))

            elif l_type == "GRU":
                units = l.get("units", 64)
                ret_seq = l.get("return_sequences", False)
                model.add(layers.GRU(units=units, return_sequences=ret_seq))

            elif l_type == "BatchNormalization":
                model.add(layers.BatchNormalization())

            else:
                raise ValueError(f"Tipo de capa no soportado: {l_type}")

        # Selección de optimizador
        opt_name = hyperparameters.get("optimizer", "adam").lower()
        lr = hyperparameters.get("learning_rate", 0.001)

        if opt_name == "adam":
            optimizer = optimizers.Adam(learning_rate=lr)
        elif opt_name == "sgd":
            optimizer = optimizers.SGD(learning_rate=lr)
        elif opt_name == "rmsprop":
            optimizer = optimizers.RMSprop(learning_rate=lr)
        else:
            optimizer = optimizers.Adam(learning_rate=lr)

        loss_name = hyperparameters.get("loss", "binary_crossentropy")
        metrics = hyperparameters.get("metrics", ["accuracy"])

        model.compile(optimizer=optimizer, loss=loss_name, metrics=metrics)
        logger.info(f"Modelo Keras compilado exitosamente: {model.count_params()} parámetros.")
        return model
