# Especificación de API RESTful v1 & Eventos

Prefijo base: `/api/v1`  
Formato de transporte: `application/json`  
Autenticación: `Bearer <JWT_TOKEN>`

---

## 1. Módulo de Autenticación (`/auth`)

### `POST /auth/login`
- **Request Body:**
  ```json
  {
    "email": "engineer@neurolab.enterprise",
    "password": "SecurePassword123!"
  }
  ```
- **Response 200 OK:**
  ```json
  {
    "access_token": "eyJhbGciOi...",
    "token_type": "bearer",
    "expires_in": 28800,
    "user": {
      "id": "c138d879-112e-4b44-b0db-6e1d283626fa",
      "email": "engineer@neurolab.enterprise",
      "display_name": "Ingeniero IA",
      "role": "AI_ENGINEER"
    }
  }
  ```

---

## 2. Módulo de Proyectos (`/projects`)

### `GET /projects`
- Retorna la lista de proyectos en los que el usuario participa o es propietario.

### `POST /projects`
- **Request Body:**
  ```json
  {
    "name": "Detección de Fraude Transaccional",
    "description": "Red neuronal feedforward profunda para clasificación binaria de fraudes bancarios."
  }
  ```

### `GET /projects/{id}`
- Retorna el detalle del proyecto, recuento de arquitecturas, datasets y trabajos.

---

## 3. Módulo de Arquitecturas (`/projects/{id}/architectures`)

### `POST /projects/{id}/architectures`
- Valida matemáticamente y persiste la topología de la red.
- **Request Body:**
  ```json
  {
    "name": "MLP Fraud Classifier",
    "family": "FEEDFORWARD",
    "config": {
      "input_shape": [30],
      "layers": [
        {"type": "Dense", "units": 64, "activation": "relu"},
        {"type": "Dropout", "rate": 0.2},
        {"type": "Dense", "units": 32, "activation": "relu"},
        {"type": "Dense", "units": 1, "activation": "sigmoid"}
      ]
    }
  }
  ```

---

## 4. Módulo de Entrenamientos (`/training-jobs`)

### `POST /projects/{id}/training-jobs`
- Valida y encola un entrenamiento asíncrono.
- **Request Body:**
  ```json
  {
    "architecture_id": "9a2f7c04-...",
    "dataset_id": "f5e4d3c2-...",
    "hyperparameters": {
      "epochs": 50,
      "batch_size": 32,
      "optimizer": "adam",
      "learning_rate": 0.001,
      "loss": "binary_crossentropy",
      "metrics": ["accuracy"]
    }
  }
  ```
- **Response 202 Accepted:**
  ```json
  {
    "job_id": "7b89211c-...",
    "status": "QUEUED",
    "created_at": "2026-11-01T15:30:00Z"
  }
  ```

### `GET /training-jobs/{id}`
- Consulta el estado persistido, progreso actual y métricas acumuladas.

### `POST /training-jobs/{id}/cancel`
- Solicita la cancelación cooperativa del worker.

### `GET /training-jobs/{id}/events` (SSE / WebSocket)
- Streaming continuo de telemetría de época:
  ```json
  {
    "event": "epoch_end",
    "job_id": "7b89211c-...",
    "epoch": 12,
    "total_epochs": 50,
    "progress": 24.0,
    "metrics": {
      "loss": 0.3421,
      "accuracy": 0.8850,
      "val_loss": 0.3610,
      "val_accuracy": 0.8710
    }
  }
  ```
