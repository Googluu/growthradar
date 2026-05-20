"""
src/models/dashboard_job.py

ACTUALIZACIÓN del modelo DashboardJob para almacenar los params completos
del AuditFormData. Agrega:
  - business_name        (str, nullable)
  - target_keywords      (list[str], nullable, JSONB)
  - google_business_keyword (str, nullable)
  - fetch_reviews        (bool, default False)
  - location_code        (int, default 2170)
  - language_code        (str, default "es")
  - cache_key            (str, indexed)  ← clave para dedup correcto

Después de aplicar este modelo, generar la migración Alembic con:
  alembic revision --autogenerate -m "extend dashboard_job with full audit params"
  alembic upgrade head

O usar el script de migración manual en migration_add_cache_key.py
si preferís control fino.
"""

import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, Column, DateTime, Index, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from src.database import Base


class DashboardJob(Base):
    __tablename__ = "dashboard_jobs"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )

    # ── Identificación del audit ────────────────────────────────────────────
    domain: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    keyword: Mapped[str] = mapped_column(String(255), nullable=False)

    # ── NUEVAS columnas ─────────────────────────────────────────────────────
    business_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    target_keywords: Mapped[list | None] = mapped_column(JSONB, nullable=True)
    google_business_keyword: Mapped[str | None] = mapped_column(String(255), nullable=True)
    fetch_reviews: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    location_code: Mapped[int] = mapped_column(Integer, default=2170, nullable=False)
    language_code: Mapped[str] = mapped_column(String(8), default="es", nullable=False)

    # ── Cache key: hash determinístico de TODOS los params relevantes ───────
    # Permite dedup correcto: misma combinación de params → mismo job.
    # Ver _build_cache_key() en public_audits.py para la lógica.
    cache_key: Mapped[str] = mapped_column(String(64), nullable=False, index=True)

    # ── Estado del job ──────────────────────────────────────────────────────
    status: Mapped[str] = mapped_column(
        String(20), default="pending", nullable=False, index=True
    )  # pending | running | completed | failed
    result: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    error: Mapped[str | None] = mapped_column(Text, nullable=True)

    # ── Timestamps ──────────────────────────────────────────────────────────
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    __table_args__ = (
        # Búsquedas frecuentes de dedup: por cache_key + status completado reciente
        Index("ix_dashboard_jobs_cache_status", "cache_key", "status"),
    )