# Modelo de Datos - NeuroLab Enterprise

Este documento detalla el diccionario de datos y las relaciones entre entidades persistidas en PostgreSQL.

## 1. Entidades y Diccionario de Datos

### 1.1 `users`
Almacena las credenciales y perfiles de los usuarios de la plataforma.
- `id` (UUID, PK): Identificador único de usuario.
- `email` (VARCHAR 255, Unique): Correo corporativo del usuario.
- `password_hash` (VARCHAR 255): Hash bcrypt de la contraseña.
- `display_name` (VARCHAR 150): Nombre visible del usuario.
- `role` (VARCHAR 50): Rol global en el sistema (`ADMIN`, `PROJECT_LEAD`, `AI_ENGINEER`, `REVIEWER`, `VIEWER`).
- `status` (VARCHAR 50): Estado de la cuenta (`ACTIVE`, `INACTIVE`, `SUSPENDED`).
- `created_at` (TIMESTAMPTZ): Fecha de creación.

### 1.2 `projects`
Contenedor principal para experimentación y colaboración en IA.
- `id` (UUID, PK): Identificador del proyecto.
- `name` (VARCHAR 200): Título del proyecto.
- `description` (TEXT): Alcance y descripción del problema a resolver.
- `owner_id` (UUID, FK -> users.id): Creador y responsable del proyecto.
- `status` (VARCHAR 50): Estado (`ACTIVE`, `ARCHIVED`).
- `created_at` / `updated_at` (TIMESTAMPTZ).

### 1.3 `project_members`
Tabla de asociación para control de acceso RBAC por proyecto.
- `project_id` (UUID, PK, FK -> projects.id).
- `user_id` (UUID, PK, FK -> users.id).
- `role` (VARCHAR 50): Rol específico dentro del proyecto.

### 1.4 `architectures`
Topologías de redes neuronales validadas y versionadas.
- `id` (UUID, PK): Identificador de la arquitectura.
- `project_id` (UUID, FK -> projects.id): Proyecto al que pertenece.
- `name` (VARCHAR 200): Nombre descriptivo (ej. "MLP Clasificación Churn v1").
- `family` (VARCHAR 50): Familia de red (`FEEDFORWARD`, `RNN`, `CNN`, `GAN`).
- `config_json` (JSONB): Estructura detallada de capas, unidades, activaciones y tensores de entrada/salida.
- `version` (INT): Número de versión secuencial.

### 1.5 `datasets`
Metadatos de los conjuntos de datos aprobados para entrenamiento.
- `id` (UUID, PK): Identificador del dataset.
- `project_id` (UUID, FK -> projects.id): Proyecto asociado.
- `name` (VARCHAR 200): Nombre del dataset.
- `version` (VARCHAR 50): Etiqueta de versión (ej. `v1.0`).
- `storage_key` (VARCHAR 500): Ruta en Object Storage / S3.
- `metadata_json` (JSONB): Esquema de columnas, recuento de filas, tipos y split ratios.

### 1.6 `training_jobs`
Registro de ejecuciones de entrenamiento (ciclo de vida).
- `id` (UUID, PK): Identificador del trabajo.
- `project_id` (UUID, FK -> projects.id).
- `architecture_id` (UUID, FK -> architectures.id).
- `dataset_id` (UUID, FK -> datasets.id).
- `status` (VARCHAR 50): `QUEUED`, `PREPARING`, `RUNNING`, `COMPLETED`, `FAILED`, `CANCELLED`.
- `progress` (NUMERIC 5,2): Porcentaje de avance de 0.00% a 100.00%.
- `hyperparameters` (JSONB): Batch size, epochs, learning rate, optimizador, loss function.
- `started_at` / `ended_at` (TIMESTAMPTZ): Tiempos de ejecución.
- `error_message` (TEXT): Registro técnico en caso de fallo.

### 1.7 `training_metrics`
Registro de telemetría por época emitido por Keras.
- `id` (BIGSERIAL, PK).
- `job_id` (UUID, FK -> training_jobs.id).
- `epoch` (INT): Número de época actual.
- `metric_name` (VARCHAR 100): Nombre (`loss`, `accuracy`, `val_loss`, `val_accuracy`).
- `metric_value` (DOUBLE PRECISION): Valor numérico.
- `recorded_at` (TIMESTAMPTZ).

### 1.8 `model_versions`
Artefactos de modelos entrenados y aprobados.
- `id` (UUID, PK).
- `project_id` (UUID, FK -> projects.id).
- `job_id` (UUID, FK -> training_jobs.id).
- `version` (VARCHAR 50): Versión semántica (ej. `1.0.0`).
- `storage_key` (VARCHAR 500): Ubicación del archivo serializado (`.keras`).
- `status` (VARCHAR 50): `DRAFT`, `REVIEWED`, `APPROVED`, `RETIRED`.
- `checksum` (VARCHAR 128): Hash SHA-256 inmutable de los pesos.
- `metrics_summary` (JSONB): Resumen de evaluación (F1, precisión, recall, test loss).

### 1.9 `audit_events`
Trazabilidad de auditoría de acciones sensibles.
- `id` (UUID, PK).
- `actor_id` (UUID, FK -> users.id).
- `project_id` (UUID, FK -> projects.id).
- `action` (VARCHAR 100): Código de acción ejecutada.
- `metadata_json` (JSONB): Datos contextuales e IP/User-Agent.
- `created_at` (TIMESTAMPTZ).
