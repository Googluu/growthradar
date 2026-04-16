# Un solo Dockerfile para la API y el worker Celery.
# El CMD se sobreescribe en docker-compose.yml según el servicio.

FROM python:3.11-slim

# uv para gestión de dependencias (mismo tooling que en desarrollo)
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

WORKDIR /app

# Copiar manifiestos primero para aprovechar caché de capas
COPY pyproject.toml uv.lock ./

# Instalar dependencias en el entorno del sistema (sin venv en contenedor)
RUN uv sync --frozen --no-dev --no-install-project

# Copiar el código fuente
COPY src/ ./src/

# Puerto expuesto por uvicorn (solo relevante para el servicio api)
EXPOSE 8000

# CMD por defecto: API. El worker lo sobreescribe en docker-compose.yml
CMD ["uv", "run", "uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
