"""
Configuración del worker Celery.
El mismo módulo se importa tanto en la API (para enviar tareas con .delay())
como en el proceso worker (celery -A src.worker worker).

Las tareas de auditoría se registrarán aquí en fases siguientes.
"""

from celery import Celery

from src.config import settings

celery_app = Celery(
    "growth_radar",
    broker=settings.celery_broker_url,
    backend=settings.celery_result_backend,
)

celery_app.conf.update(
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    timezone="America/Bogota",
    enable_utc=True,
    include=["src.tasks.audit", "src.tasks.public_audit", "src.tasks.dashboard_audit"],
)
