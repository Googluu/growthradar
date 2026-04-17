"""
Endpoint de health check.
Verifica conexión a PostgreSQL y Redis antes de responder.

GET /health → {"status": "ok", "db": "connected", "redis": "connected"}
"""

from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

import redis.asyncio as aioredis

from src.config import settings
from src.database import get_db

router = APIRouter(tags=["health"])


@router.get("/health")
async def health_check(db: AsyncSession = Depends(get_db)):
    # Verificar PostgreSQL
    db_status = "disconnected"
    try:
        await db.execute(text("SELECT 1"))
        db_status = "connected"
    except Exception:
        pass

    # Verificar Redis
    redis_status = "disconnected"
    try:
        async with aioredis.Redis.from_url(settings.redis_url, socket_connect_timeout=2) as r:
            await r.ping()  # type: ignore[misc]  # stubs de redis-py no reflejan el return async
        redis_status = "connected"
    except Exception:
        pass

    status = "ok" if db_status == "connected" and redis_status == "connected" else "degraded"

    return {
        "status": status,
        "db": db_status,
        "redis": redis_status,
    }
