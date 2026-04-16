"""
Setup de la base de datos con SQLAlchemy async.
Usa asyncpg como driver — requerido para FastAPI async.

Para obtener una sesión en un endpoint:
    from src.database import get_db
    async def my_route(db: AsyncSession = Depends(get_db)): ...
"""

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from src.config import settings

engine = create_async_engine(
    settings.database_url,
    echo=settings.app_env == "development",  # log SQL solo en dev
    pool_pre_ping=True,  # verifica conexión antes de usar del pool
)

AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


class Base(DeclarativeBase):
    """Base para todos los modelos ORM del proyecto."""
    pass


async def get_db():
    """Dependency de FastAPI — entrega una sesión y la cierra al terminar."""
    async with AsyncSessionLocal() as session:
        yield session
