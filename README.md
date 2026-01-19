# Backend Checker (Bun + Elysia)

Servicio en Bun/Elysia para sincronizar campañas desde un CMS, descargar media, generar playlist y exponer endpoints.

## Requisitos
- Bun
- SQL Server (o conexión configurada en las env vars)

## Configuración
1) Copia el archivo de ejemplo:

```
cp .env.example .env
```

2) Completa las variables necesarias (ver sección ENV).

## Scripts
```
bun run dev
bun test --coverage
```

## ENV
Estas variables se usan en runtime (ver src/config/config.ts):

- SECRET_KEY
- API_KEY_CMS
- CMD_BASE_URL
- CMS_MEDIA_BASE_URL
- CMS_ROUTE_SNAPSHOT
- PORT
- SERVER_NEXT_PUBLIC_PRICE_CHECKER_URL
- DATABASE_URL
- DB_USER
- DB_PASSWORD
- DB_NAME
- DB_HOST
- DB_PORT
- SYNC_TTL_HOURS
- DOWNLOAD_CONCURRENCY
- FETCH_TIMEOUT_SECONDS

## Endpoints
- GET /api/health
- GET /api/playlist
- GET /api/media/*
- GET /api/events (SSE)
- POST /api/sync/force

## Tareas programadas
- Sincronización diaria (5AM y 12PM)
- Generación de playlist cada hora
- Reintento de descargas fallidas cada hora

## Limpieza automática
Al generar la playlist se eliminan campañas vencidas del JSON y se borran medias huérfanas (archivos que no pertenecen a campañas activas).