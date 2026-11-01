-- ====================================================================
-- NEUROLAB ENTERPRISE - DDL DE BASE DE DATOS INICIAL
-- PostgreSQL 16+
-- Especificación de Sección 8: Modelo de Datos Inicial
-- ====================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Usuarios e Identidad
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(150) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'AI_ENGINEER', -- ADMIN, PROJECT_LEAD, AI_ENGINEER, REVIEWER, VIEWER
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',    -- ACTIVE, INACTIVE, SUSPENDED
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Proyectos de IA
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, ARCHIVED
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Miembros y Roles por Proyecto
CREATE TABLE IF NOT EXISTS project_members (
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL DEFAULT 'AI_ENGINEER',
    added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (project_id, user_id)
);

-- 4. Datasets
CREATE TABLE IF NOT EXISTS datasets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    version VARCHAR(50) NOT NULL DEFAULT 'v1.0',
    storage_key VARCHAR(500) NOT NULL,
    metadata_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Arquitecturas Neuronales
CREATE TABLE IF NOT EXISTS architectures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    family VARCHAR(50) NOT NULL, -- FEEDFORWARD, RNN, CNN, GAN
    config_json JSONB NOT NULL,
    version INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Trabajos de Entrenamiento (Jobs)
CREATE TABLE IF NOT EXISTS training_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    architecture_id UUID NOT NULL REFERENCES architectures(id) ON DELETE RESTRICT,
    dataset_id UUID NOT NULL REFERENCES datasets(id) ON DELETE RESTRICT,
    status VARCHAR(50) NOT NULL DEFAULT 'QUEUED', -- QUEUED, PREPARING, RUNNING, COMPLETED, FAILED, CANCELLED
    progress NUMERIC(5,2) NOT NULL DEFAULT 0.0,
    hyperparameters JSONB NOT NULL DEFAULT '{}'::jsonb,
    started_at TIMESTAMP WITH TIME ZONE,
    ended_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Métricas de Entrenamiento por Época
CREATE TABLE IF NOT EXISTS training_metrics (
    id BIGSERIAL PRIMARY KEY,
    job_id UUID NOT NULL REFERENCES training_jobs(id) ON DELETE CASCADE,
    epoch INT NOT NULL,
    metric_name VARCHAR(100) NOT NULL, -- loss, accuracy, val_loss, val_accuracy, mae, etc.
    metric_value DOUBLE PRECISION NOT NULL,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Registro de Versiones de Modelos (Model Registry)
CREATE TABLE IF NOT EXISTS model_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES training_jobs(id) ON DELETE RESTRICT,
    version VARCHAR(50) NOT NULL,
    storage_key VARCHAR(500) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'DRAFT', -- DRAFT, REVIEWED, APPROVED, RETIRED
    checksum VARCHAR(128) NOT NULL,
    metrics_summary JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Auditoría de Acciones Relevantes (Audit Events)
CREATE TABLE IF NOT EXISTS audit_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL, -- CREATE_PROJECT, TRAIN_JOB_START, CANCEL_JOB, APPROVE_MODEL, etc.
    metadata_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices de Rendimiento
CREATE INDEX IF NOT EXISTS idx_projects_owner ON projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_architectures_project ON architectures(project_id);
CREATE INDEX IF NOT EXISTS idx_datasets_project ON datasets(project_id);
CREATE INDEX IF NOT EXISTS idx_training_jobs_project ON training_jobs(project_id);
CREATE INDEX IF NOT EXISTS idx_training_jobs_status ON training_jobs(status);
CREATE INDEX IF NOT EXISTS idx_metrics_job_epoch ON training_metrics(job_id, epoch);
CREATE INDEX IF NOT EXISTS idx_model_versions_project ON model_versions(project_id);
CREATE INDEX IF NOT EXISTS idx_audit_events_project ON audit_events(project_id);
CREATE INDEX IF NOT EXISTS idx_audit_events_actor ON audit_events(actor_id);
