"""extend dashboard_job with full audit params

Revision ID: a1b2c3d4e5f6
Revises: <PREVIOUS_REVISION_ID>     ← reemplazar con el ID de tu última migración
Create Date: 2026-05-20

Migración para agregar columnas necesarias para el audit completo:
  business_name, target_keywords, google_business_keyword,
  fetch_reviews, location_code, language_code, cache_key

Cómo aplicar:
  1. Copiar este archivo a: backend/alembic/versions/a1b2c3d4e5f6_extend_dashboard_job.py
  2. Reemplazar 'down_revision' con el ID de tu última migración existente
  3. Ejecutar: alembic upgrade head

Reversible: sí, downgrade() elimina las columnas nuevas.
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB


# revision identifiers, used by Alembic.
revision = "a1b2c3d4e5f6"
down_revision = None      # ← REEMPLAZAR con el revision ID de tu migración previa
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "dashboard_jobs",
        sa.Column("business_name", sa.String(255), nullable=True),
    )
    op.add_column(
        "dashboard_jobs",
        sa.Column("target_keywords", JSONB, nullable=True),
    )
    op.add_column(
        "dashboard_jobs",
        sa.Column("google_business_keyword", sa.String(255), nullable=True),
    )
    op.add_column(
        "dashboard_jobs",
        sa.Column(
            "fetch_reviews",
            sa.Boolean,
            nullable=False,
            server_default=sa.false(),
        ),
    )
    op.add_column(
        "dashboard_jobs",
        sa.Column(
            "location_code",
            sa.Integer,
            nullable=False,
            server_default="2170",
        ),
    )
    op.add_column(
        "dashboard_jobs",
        sa.Column(
            "language_code",
            sa.String(8),
            nullable=False,
            server_default="es",
        ),
    )
    op.add_column(
        "dashboard_jobs",
        sa.Column("cache_key", sa.String(64), nullable=True),  # nullable temporal
    )

    # Backfill cache_key para filas existentes basado en domain + keyword
    # Esto evita errores de NOT NULL en una tabla con datos existentes.
    op.execute("""
        UPDATE dashboard_jobs
        SET cache_key = encode(
            sha256((domain || '|' || COALESCE(keyword, ''))::bytea),
            'hex'
        )
        WHERE cache_key IS NULL
    """)

    # Ahora hacer la columna NOT NULL
    op.alter_column("dashboard_jobs", "cache_key", nullable=False)

    # Índices
    op.create_index(
        "ix_dashboard_jobs_cache_key",
        "dashboard_jobs",
        ["cache_key"],
    )
    op.create_index(
        "ix_dashboard_jobs_cache_status",
        "dashboard_jobs",
        ["cache_key", "status"],
    )


def downgrade() -> None:
    op.drop_index("ix_dashboard_jobs_cache_status", table_name="dashboard_jobs")
    op.drop_index("ix_dashboard_jobs_cache_key", table_name="dashboard_jobs")
    op.drop_column("dashboard_jobs", "cache_key")
    op.drop_column("dashboard_jobs", "language_code")
    op.drop_column("dashboard_jobs", "location_code")
    op.drop_column("dashboard_jobs", "fetch_reviews")
    op.drop_column("dashboard_jobs", "google_business_keyword")
    op.drop_column("dashboard_jobs", "target_keywords")
    op.drop_column("dashboard_jobs", "business_name")