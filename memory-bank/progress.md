# Progress Log

## Fecha: 18 de Noviembre, 2026

### Completado
- Análisis de incidencias compartido en `services/api/src/api/incidents/analysis.py`, usado por la CLI `scripts/analyze.py` y por la API FastAPI.
- Rutas FastAPI `POST /api/incidents/analyze` y `GET /api/incidents/results/export`; exportan solo métricas agregadas.
- Retirados `services/api/app.py` (Flask) y `uis/backoffice/app.py` (Streamlit); nuevo frontend Next.js en `uis/backoffice`.
- Middleware CORS restaurado en `services/api/src/api/main.py` solo para `http://localhost:3000`.
- `scripts/incidents-HEALTHCORE.csv` ahora contiene los 100 registros de prueba; `scripts/incidents-HEALTHCORE-datos-prueba.csv` es una copia y `scripts/analizar-datos-prueba.sh` lo ejecuta.
- README de la API actualizado con alcance, datos de prueba y exportación.

### Pendiente
- Confirmar catálogo de categorías y valores de referencia del briefing.
- Validar y confirmar el commit con el desarrollador.

## Fecha: 17 de Noviembre, 2026

### ✅ Completado en esta sesión
- ✓ Configuración de memoria del agente (memory-bank/) — 3 archivos documentados
  - `projectbrief.md` — Descripción de HealthCore y su contexto de negocio
  - `techContext.md` — Stack tecnológico y estructura del monorepo
  - `progress.md` — Registro de progreso (actualizado con fecha real)

- ✓ Definición de AGENTS.md — Flujo obligatorio de 4 pasos antes de commit
  - Paso 1: Revisar errores de sintaxis
  - Paso 2: Actualizar memory-bank/progress.md
  - Paso 3: Pedir confirmación del desarrollador
  - Paso 4: Hacer commit con mensaje claro

- ✓ Creación de carpeta `.agents/rules/` con 2 reglas documentadas
  - `compliance-and-data-access.md` — Regla HIPAA/GDPR (siempre activa)
  - `folder-structure.md` — Regla de ubicación de código (siempre activa)

- ✓ Creación de skill: `validate-precommit.md`
  - Skill para validar sintaxis, secrets, carpetas y documentación antes de commit
  - Incluye fases de validación, criterios de aceptación y pseudocódigo
  - Integrada con el flujo de AGENTS.md

### 📋 Estado de Requisitos
- [x] memory-bank/ con 3 archivos (projectbrief, techContext, progress)
- [x] AGENTS.md con 4 pasos de commit documentados
- [x] .agents/rules/ con al menos 2 reglas + alcance de aplicación
- [x] Skill implementada con objetivo, inputs y criterios verificables
- [x] Claridad sobre /uis/website, /uis/backoffice y /services
- [x] Sin carpetas de app paralelas creadas

### 🎯 Próximos Pasos
- Crear PR hacia main desde feature/agent-memory-bank
- Incluir enlace a AGENTS.md en descripción de PR
- Completar review y merge a main
- Comenzar con desarrollo de features específicas de HealthCore

## Fecha: 18 de Noviembre, 2026 (rama feature/agent-memory-bank-v2)

### Completado
- Controles de seguridad aprobados por el desarrollador, implementados en `services/api`:
  - `/api/incidents/analyze` y `/api/incidents/results/export` exigen token JWT Bearer (401 sin token).
  - Módulo `core/audit.py`: escribe `audit.log` (JSON por línea) con login, análisis y exportación; sin contraseñas, tokens ni contenido de CSV.
  - Login registra éxito y fallo (sin email intentado).
  - `audit.log` añadido a `.gitignore`; README actualizado con token y auditoría.
- Verificación HTTP en copia temporal: 401 sin token, 200 con token, 404 export sin análisis, `/records` protegido, auditoría correcta, sin trazas en servidor.
- Rama nueva `feature/agent-memory-bank-v2` desde `main`; la rama antigua `feature/agent-memory-bank` no se modificó.

- Los 401 de rutas protegidas se auditan (`auth.access` / `denied`) en `services/api/src/api/core/deps.py`; verificado por HTTP.
- Backoffice: login (`/auth/login`) con token solo en memoria, cabecera Bearer en análisis y exportación, botón "Cerrar sesión", reescritura `/auth/:path*` en `next.config.ts`. Build de Next.js compilado sin errores.
- Prueba end-to-end del login a través de la reescritura de Next.js: 200 con credenciales válidas, 401 con inválidas, análisis y exportación 200 con token, 401 sin token. Las reescrituras se fijan al compilar (`next build`), por lo que `HEALTHCORE_API_URL` debe estar definido en el build.

### Decisiones
- Roles: `admin` y `user` acceden a incidencias y registros; basta con token válido (sin autorización por rol adicional).
- Catálogo: sin catálogo oficial; se mantienen las 5 categorías actuales.

### Pendiente
- HTTPS/transporte: pendiente hasta el despliegue y la aprobación de Cumplimiento.

### Hecho después (mismo día)
- HTTPS documentado como requisito explícito en `services/api/README.md` y `docs/ARQUITECTURA_PROPUESTA.md` (punto 5 de decisiones técnicas).
- `services/api/.env` y `services/api/db.json` dejan de estar en Git (ya estaban en `.gitignore`); se conservan en local. `SECRET_KEY` rotada (la anterior estaba versionada).
- Restaurados los `.pyc` trackeados que Python modificaba.
- Registrado un usuario de prueba en la base local y verificado el login.
- Prueba manual en backoffice (localhost:3000): login correcto y análisis de `scripts/incidents-HEALTHCORE.csv` con 100 registros leídos, 100 válidos, 0 inválidos.
- `POST /users` restringido a rol `admin` (router y README actualizados), aprobado por el desarrollador.
- Verificado `POST /users`: 403 con token de rol `user`, 201 con token de `admin` (usuario temporal borrado después, 204).
- Contraseña de `tatiana1986@correo.com` cambiada en la base local.
- `.env` antiguo de `42eb0ba` aceptado por el desarrollador (sin reescribir historial).
- Eliminado `docs/confirmacion_healthcore.pdf` (documento ficticio, no es aprobación).
- Sección "Alcance y seguridad" de `services/api/README.md` corregida: sin aprobación de Cumplimiento registrada y HTTPS no implementado.
