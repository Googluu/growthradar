# Importar todos los modelos aquí para que SQLAlchemy los registre
# en Base.metadata antes de llamar a create_all.
from src.models.company import Company  # noqa: F401
from src.models.audit_job import AuditJob  # noqa: F401
