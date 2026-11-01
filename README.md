# NeuroLab Enterprise 🧠🚀
> **Plataforma Enterprise de Experimentación y Gestión de Redes Neuronales Artificiales**  
> *Aplicación práctica de las operaciones de la Semana 11 (Machine Learning & Deep Learning)*  
> *React + TypeScript + FastAPI + TensorFlow/Keras + PostgreSQL + Redis + Workers Asíncronos*

---

## 🌟 Visión del Proyecto
**NeuroLab Enterprise** es una plataforma web corporativa modular y extensible diseñada para que ingenieros de IA, científicos de datos y líderes técnicos puedan **comprender, diseñar, validar, entrenar, evaluar y versionar modelos de Redes Neuronales Artificiales (ANNs)** con los más altos estándares de trazabilidad, seguridad y escalabilidad empresarial.

La plataforma implementa rigurosamente el contenido académico de la Semana 11:
1. **Definir la red neuronal y su importancia:** Módulo de fundamentos interactivo con conceptos, neuronas biológicas vs artificiales, pesos, sesgos y funciones de activación.
2. **Describir la estructura:** Constructor visual interactivo de topologías neuronales con validación dimensional de tensores en servidor.
3. **Identificar tipos de redes:** Catálogo y soporte para 4 familias principales: **Feedforward (FNN)**, **Recurrentes (RNN/LSTM/GRU)**, **Convolucionales (CNN)** y **Generativas Adversarias (GAN)**.
4. **Crear redes con TensorFlow y Keras:** Motor de compilación, ejecución asíncrona en workers aislados, seguimiento de métricas en tiempo real vía Server-Sent Events / WebSockets y registro inmutable de modelos.

---

## 🏗️ Arquitectura de la Solución

```
                                  [ Usuario / Navegador ]
                                             │
                                   (React + TypeScript)
                                             │  HTTP REST / WebSocket
                                             ▼
                                  [ API Gateway / FastAPI ]
                                             │
                      ┌──────────────────────┼──────────────────────┐
                      ▼                      ▼                      ▼
               [ PostgreSQL 16 ]       [ Redis Queue ]      [ Object Storage / MinIO ]
               (Metadatos & Runs)     (Cola de Trabajos)     (Model Weights & Datasets)
                                             │
                                             ▼
                                   [ Worker TensorFlow ]
                                  (Keras Model Builder &
                                    Epoch Telemetry Stream)
```

---

## 📁 Estructura del Monorepo

```
neurolab-enterprise/
├── apps/
│   └── web/                   # Aplicación Frontend React + Vite + TypeScript + Tailwind
│       └── src/
│           ├── app/           # Enrutamiento, Providers y Configuración Global
│           ├── components/    # Componentes de UI corporativa (Layout, Shell, Badges, Modales)
│           ├── features/      # Módulos funcionales de negocio (M01 a M10)
│           │   ├── dashboard/        # M01: Dashboard corporativo y KPIs
│           │   ├── projects/         # M02: Gestión de proyectos y miembros
│           │   ├── fundamentals/     # M03: Fundamentos neuronales y glosario interactivo
│           │   ├── architectures/    # M04: Diseñador visual de redes (FNN, CNN, RNN, GAN)
│           │   ├── datasets/         # M05: Catálogo y preparación de datos
│           │   ├── training/         # M06: Orquestador y monitor en vivo de entrenamientos
│           │   ├── evaluation/       # M07: Curvas de pérdida/exactitud y comparador
│           │   ├── model-registry/   # M08: Registro inmutable y ciclo de vida de modelos
│           │   ├── reports/          # M09: Generador de fichas y exportación
│           │   └── administration/   # M10: RBAC, cuotas de cómputo y auditoría
│           ├── lib/           # Clientes HTTP, adaptadores WebSocket/SSE y utilidades
│           ├── hooks/         # Custom React Hooks
│           ├── types/         # Definiciones TypeScript de entidades y contratos API
│           └── styles/        # Estilos globales y tokens de diseño
├── services/
│   └── api/                   # Backend FastAPI RESTful v1
│       ├── app/
│       │   ├── api/v1/        # Routers por dominio (/projects, /architectures, /jobs, etc.)
│       │   ├── core/          # Configuración, seguridad JWT, base de datos y logging
│       │   ├── modules/       # Lógica de dominio y validación estricta de tensores
│       │   ├── schemas/       # Modelos Pydantic v2 (contratos de entrada y salida)
│       │   ├── repositories/  # Capa de acceso a datos con SQLAlchemy Async
│       │   └── main.py        # Punto de entrada de la aplicación FastAPI
│       └── tests/             # Pruebas unitarias y de integración
├── workers/
│   └── training/              # Worker asíncrono de TensorFlow/Keras
│       ├── worker.py          # Consumidor de colas y ejecutor de máquina de estados
│       ├── builder.py         # Compilador dinámico de arquitecturas Keras
│       ├── trainer.py         # Callback de telemetría de época en tiempo real
│       ├── evaluator.py       # Evaluación de métricas y matrices de validación
│       └── storage.py         # Serialización de pesos y cálculo de hash SHA-256
├── infra/
│   ├── docker/                # Dockerfiles optimizados para Web, API y Worker
│   ├── migrations/            # DDL SQL de PostgreSQL con particiones e índices
│   └── monitoring/            # Configuración de métricas y health checks
├── docs/
│   ├── architecture/          # Diagramas C4, modelo de datos y decisiones técnicas
│   ├── api/                   # Especificación OpenAPI y contratos de eventos
│   └── operations/            # Guías de despliegue, seguridad y respaldo
├── docker-compose.yml         # Orquestación completa de servicios locales
└── README.md
```

---

## 🚀 Despliegue Rápido Local con Docker

Para levantar la suite completa (PostgreSQL, Redis, MinIO, API FastAPI, Worker TensorFlow y Frontend React):

```bash
# 1. Clonar el repositorio y copiar variables de entorno
cp .env.example .env

# 2. Iniciar los contenedores
docker-compose up --build
```

- **Frontend Web:** http://localhost:5173
- **API FastAPI (Docs Swagger):** http://localhost:8000/docs
- **Métricas / Healthcheck:** http://localhost:8000/health
- **MinIO Object Storage Console:** http://localhost:9001 (minioadmin / minioadmin)

---

## 👥 Matriz de Roles (RBAC)

1. **Administrador:** Gestión de usuarios, asignación de cuotas de cómputo y auditoría global.
2. **Responsable de Proyecto:** Crea proyectos, gestiona colaboradores y aprueba versiones de modelos para producción.
3. **Ingeniero/Analista de IA:** Diseña arquitecturas neuronales, configura datasets y despacha entrenamientos.
4. **Revisor:** Valida métricas, compara curvas de entrenamiento y emite aprobaciones.
5. **Lector:** Consulta de dashboards, estadísticas y reportes en modo solo lectura.

---

## 🔒 Reglas Críticas de Negocio y Seguridad
- **Sin ejecuciones en el cliente:** TensorFlow nunca se ejecuta en el navegador para tareas de entrenamiento real.
- **Validación matemática en Backend:** Toda configuración de capas es validada dimensionalmente en FastAPI antes de encolar.
- **Máquina de estados estricta:** `QUEUED` ➔ `PREPARING` ➔ `RUNNING` ➔ `COMPLETED` / `FAILED` / `CANCELLED`.
- **Inmutabilidad de Modelos:** Los modelos entrenados se guardan con su hash SHA-256 y nunca se sobreescriben.
