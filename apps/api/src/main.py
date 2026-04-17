"""
Punto de entrada de la API Growth Radar.
En producción: uvicorn src.main:app --host 0.0.0.0 --port 8000
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI

from src.config import settings
from src.database import Base, engine
import src.models  # noqa: F401 — registra todos los modelos en Base.metadata
from src.routes.auth import router as auth_router
from src.routes.audits import router as audits_router
from src.routes.companies import router as companies_router
from src.routes.health import router as health_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Crea las tablas al iniciar si no existen.
    # En producción se reemplazará por migraciones Alembic.
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield


app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    lifespan=lifespan,
    docs_url="/docs" if settings.app_env == "development" else None,
    redoc_url=None,
)

app.include_router(health_router)
app.include_router(auth_router)
app.include_router(companies_router)
app.include_router(audits_router)
