from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings

# Import API routers
from app.api.v1.auth import router as auth_router
from app.api.v1.projects import router as projects_router
from app.api.v1.architectures import router as architectures_router
from app.api.v1.datasets import router as datasets_router
from app.api.v1.training_jobs import router as training_jobs_router
from app.api.v1.models import router as models_router
from app.api.v1.fundamentals import router as fundamentals_router
from app.api.v1.audit_events import router as audit_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Setup actions (e.g. DB connection checks, Redis warmup)
    yield
    # Teardown actions

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="API empresarial para diseño, validación, entrenamiento y ciclo de vida de redes neuronales artificiales (Semana 11).",
    lifespan=lifespan,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc"
)

# Configuración CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registro de routers v1
api_v1 = settings.API_V1_STR
app.include_router(auth_router, prefix=api_v1)
app.include_router(projects_router, prefix=api_v1)
app.include_router(architectures_router, prefix=api_v1)
app.include_router(datasets_router, prefix=api_v1)
app.include_router(training_jobs_router, prefix=api_v1)
app.include_router(models_router, prefix=api_v1)
app.include_router(fundamentals_router, prefix=api_v1)
app.include_router(audit_router, prefix=api_v1)

@app.get("/health", tags=["Salud del Sistema"])
async def health_check():
    return {
        "status": "healthy",
        "service": "neurolab-api",
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT
    }

@app.get("/", tags=["Root"])
async def root():
    return {
        "name": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs": f"{settings.API_V1_STR}/docs"
    }
