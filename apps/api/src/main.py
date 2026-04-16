"""
Punto de entrada de la API Growth Radar.
En producción: uvicorn src.main:app --host 0.0.0.0 --port 8000
"""

from fastapi import FastAPI

from src.config import settings
from src.routes.auth import router as auth_router
from src.routes.health import router as health_router

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    docs_url="/docs" if settings.app_env == "development" else None,
    redoc_url=None,
)

app.include_router(health_router)
app.include_router(auth_router)
