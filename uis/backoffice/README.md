# HealthCore Backoffice

Interfaz Next.js para cargar CSV de incidencias, consultar el resumen y descargar las métricas agregadas.

## Requisitos

- Node.js 20 o posterior
- API HealthCore ejecutándose en `http://127.0.0.1:8000` (ver [services/api/README.md](../../services/api/README.md))

## Arranque desde cero

```bash
cd uis/backoffice
cp .env.example .env.local
npm install
npm run dev
```

Abre `http://localhost:3000`. La variable `HEALTHCORE_API_URL` apunta al backend y la configuración de Next.js reenvía `/api/*` a ese servicio, sin requerir CORS en el navegador.

Para validar una compilación de producción:

```bash
npm run build
npm run start
```
