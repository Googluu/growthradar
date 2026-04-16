# Docker Compose — Referencia de Comandos

> Todos los comandos se ejecutan desde la **raíz del proyecto** (`/home/sneyder/dev/growth-radar/`).

---

## Ciclo de vida básico

```bash
# Levantar todos los servicios en background
docker compose up -d

# Ver estado de los servicios
docker compose ps

# Apagar los servicios (los contenedores se detienen, los datos persisten)
docker compose down

# Apagar Y borrar los volúmenes (borra la base de datos)
docker compose down -v
```

---

## Build e imágenes

```bash
# Reconstruir las imágenes (después de cambiar Dockerfile o dependencias)
docker compose build

# Reconstruir sin usar caché
docker compose build --no-cache

# Levantar y reconstruir en un solo comando
docker compose up -d --build
```

---

## Logs

```bash
# Ver logs de todos los servicios (últimas 50 líneas)
docker compose logs --tail=50

# Seguir logs en tiempo real (todos los servicios)
docker compose logs -f

# Logs de un servicio específico
docker compose logs -f api
docker compose logs -f worker
docker compose logs -f db
docker compose logs -f redis
```

---

## Reiniciar servicios

```bash
# Reiniciar todos
docker compose restart

# Reiniciar solo la API (útil después de cambios que el hot reload no capturó)
docker compose restart api

# Reiniciar solo el worker
docker compose restart worker
```

---

## Ejecutar comandos dentro de un contenedor

```bash
# Abrir bash dentro del contenedor de la API
docker compose exec api bash

# Correr un comando puntual en la API
docker compose exec api uv run python -c "from src.config import settings; print(settings)"

# Conectarse a PostgreSQL con psql
docker compose exec db psql -U postgres -d growth_radar

# Ping a Redis
docker compose exec redis redis-cli ping
```

---

## Flujo típico de desarrollo

```bash
# 1. Primera vez (o después de cambiar dependencias en pyproject.toml)
docker compose up -d --build

# 2. Día a día — la API tiene hot reload, no necesita reiniciar
docker compose up -d

# 3. Ver que todo esté ok
docker compose ps
curl http://localhost:8000/health

# 4. Al terminar el día
docker compose down
```

---

## Conflictos de puertos

### Ver qué proceso ocupa un puerto

```bash
# Ver todos los puertos en escucha
ss -tlnp

# Ver si un puerto específico está ocupado
ss -tlnp | grep 5432   # PostgreSQL
ss -tlnp | grep 6379   # Redis
ss -tlnp | grep 8000   # API / uvicorn

# Alternativa con lsof
lsof -i :5432
lsof -i :6379
```

### Detener un proceso que ocupa un puerto

```bash
# 1. Identificar el PID del proceso
ss -tlnp | grep 5432
# Ejemplo de output: LISTEN ... users:(("postgres",pid=1234,...))

# 2. Detenerlo con señal limpia
kill 1234

# 3. Si no responde, forzar
kill -9 1234
```

### Detener servicios del sistema (PostgreSQL / Redis)

```bash
# PostgreSQL
sudo systemctl stop postgresql     # detener
sudo systemctl disable postgresql  # evitar que inicie al bootear

# Redis
sudo systemctl stop redis          # detener
sudo systemctl disable redis       # evitar que inicie al bootear

# Ver estado
sudo systemctl status postgresql
sudo systemctl status redis
```

---

## Puertos en este proyecto

| Servicio | Puerto contenedor | Puerto host | Notas |
|----------|------------------|-------------|-------|
| API | 8000 | 8000 | Docs en http://localhost:8000/docs |
| PostgreSQL | 5432 | **5435** | 5432-5434 ocupados por instancias locales |
| Redis | 6379 | **6380** | 6379 ocupado por Redis local |

> Los servicios se comunican entre sí por la red interna de Docker usando los puertos del contenedor (5432, 6379). Los puertos del host solo se usan para conectarse desde herramientas externas como TablePlus o redis-cli local.
