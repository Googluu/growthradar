"""
Configuración centralizada de la aplicación.
Todas las variables se leen desde el entorno (.env en desarrollo, variables reales en producción).
"""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # Entorno
    app_env: str = "development"
    app_name: str = "Growth Radar API"
    app_version: str = "0.1.0"

    # Base de datos (PostgreSQL)
    database_url: str = "postgresql+asyncpg://postgres:postgres@db:5432/growth_radar"

    # Redis (broker Celery + caché)
    redis_url: str = "redis://redis:6379/0"

    # Celery
    celery_broker_url: str = "redis://redis:6379/0"
    celery_result_backend: str = "redis://redis:6379/1"


settings = Settings()
