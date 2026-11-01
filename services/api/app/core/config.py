from functools import lru_cache
from pathlib import Path
from typing import List

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parents[3]  # services/api


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True,
        extra="ignore",
        validate_default=True,
    )

    PROJECT_NAME: str = "NeuroLab Enterprise API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "development"
    LOG_LEVEL: str = "INFO"

    SECRET_KEY: str = "neurolab_insecure_default_secret_key_change_me_32chars"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480
    LOGIN_RATE_LIMIT_PER_MINUTE: int = 10

    POSTGRES_USER: str = "neurolab"
    POSTGRES_PASSWORD: str = "neurolab_secure_pass"
    POSTGRES_DB: str = "neurolab_db"
    POSTGRES_HOST: str = "localhost"
    POSTGRES_PORT: int = 5432
    DATABASE_URL: str = (
        f"postgresql+asyncpg://{POSTGRES_USER}:{POSTGRES_PASSWORD}"
        f"@{POSTGRES_HOST}:{POSTGRES_PORT}/{POSTGRES_DB}"
    )

    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_URL: str = f"redis://{REDIS_HOST}:{REDIS_PORT}/0"
    TRAINING_QUEUE: str = "neurolab:training:queue"

    DATA_DIR: str = str(BASE_DIR / "data" / "uploads")
    MODEL_DIR: str = str(BASE_DIR / "data" / "models")
    MAX_UPLOAD_MB: int = 50
    MAX_CSV_ROWS: int = 500_000
    MAX_CSV_COLUMNS: int = 500

    # Object storage. "local" usa DATA_DIR/MODEL_DIR; "s3" usa un bucket
    # compatible con S3 (Supabase Storage, MinIO, AWS S3, R2, etc.).
    STORAGE_BACKEND: str = "local"
    S3_ENDPOINT_URL: str = ""
    S3_REGION: str = "us-east-1"
    S3_ACCESS_KEY_ID: str = ""
    S3_SECRET_ACCESS_KEY: str = ""
    S3_BUCKET: str = "neurolab"
    S3_FORCE_PATH_STYLE: bool = True

    # Bootstrap account (change in every non-local environment).
    SEED_ADMIN_EMAIL: str = "admin@neurolab.enterprise"
    SEED_ADMIN_PASSWORD: str = "Admin123!"
    SEED_ADMIN_NAME: str = "Administrador NeuroLab"

    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
    ]
    CORS_ORIGIN_REGEX: str = ""

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def _split_origins(cls, value):
        if isinstance(value, str):
            return [item.strip() for item in value.split(",") if item.strip()]
        return value

    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def _normalize_database_url(cls, value):
        """Normaliza la URL para SQLAlchemy asyncpg.

        Supabase entrega URLs ``postgresql://`` con ``sslmode=require``. El
        driver asyncpg espera el parámetro ``ssl``; Alembic y psycopg2 vuelven
        a convertir ``ssl`` en ``sslmode`` en sus propios módulos.
        """
        url = (value or "").strip()
        if not url:
            return value
        if url.startswith("postgres://"):
            url = "postgresql+asyncpg://" + url[len("postgres://") :]
        elif url.startswith("postgresql://"):
            url = "postgresql+asyncpg://" + url[len("postgresql://") :]
        if url.startswith("postgresql+asyncpg://"):
            url = url.replace("sslmode=", "ssl=")
            if (
                "pooler.supabase.com" in url
                and ":6543" in url
                and "prepared_statement_cache_size=" not in url
            ):
                separator = "&" if "?" in url else "?"
                url += f"{separator}prepared_statement_cache_size=0"
        return url

    @property
    def upload_path(self) -> Path:
        path = Path(self.DATA_DIR)
        path.mkdir(parents=True, exist_ok=True)
        return path

    @property
    def model_path(self) -> Path:
        path = Path(self.MODEL_DIR)
        path.mkdir(parents=True, exist_ok=True)
        return path

    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT.lower() in {"production", "prod"}

    @property
    def uses_s3(self) -> bool:
        return self.STORAGE_BACKEND.strip().lower() in {"s3", "supabase", "minio", "r2"}


@lru_cache
def get_settings() -> Settings:
    settings = Settings()
    if settings.is_production and "insecure_default" in settings.SECRET_KEY:
        raise RuntimeError("SECRET_KEY insegura: configure una clave robusta en producción.")
    return settings


settings = get_settings()
