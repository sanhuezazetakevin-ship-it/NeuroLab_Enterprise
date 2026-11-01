# Guía de Operaciones y Despliegue

## 1. Requisitos Previos
- Docker Engine 24+ y Docker Compose v2+
- Node.js 20+ (para desarrollo frontend local)
- Python 3.12+ (para desarrollo backend local)

## 2. Puesta en Marcha con Docker Compose
1. Configurar variables de entorno:
   ```bash
   cp .env.example .env
   ```
2. Construir y levantar servicios:
   ```bash
   docker-compose up -d --build
   ```
3. Verificar estado de los contenedores:
   ```bash
   docker-compose ps
   ```

## 3. Ejecución Local en Modo Desarrollo

### 3.1 Backend API (FastAPI)
```bash
cd services/api
python -m venv .venv
# En Windows:
.venv\Scripts\activate
# En Linux/macOS:
source .venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### 3.2 Worker de Entrenamiento (TensorFlow / Keras)
```bash
cd workers/training
python -m venv .venv
# Activar entorno virtual
pip install -r requirements.txt
python worker.py
```

### 3.3 Frontend Web (React + Vite)
```bash
cd apps/web
npm install
npm run dev
```

## 4. Estrategia de Respaldo y Retención
- **Base de Datos:** Dump diario mediante `pg_dump -Fc neurolab_db > backup_$(date +%F).dump`.
- **Model Storage:** Políticas de retención y versionado en MinIO/S3 habilitadas con Lifecycle Rules.
