# API de HealthCore

Backend FastAPI del monorepo. La API y el script `scripts/analyze.py` usan la misma lógica en `src/api/incidents/analysis.py`.

## Requisitos

- Python 3.14 o posterior, según `pyproject.toml`

## Instalación y arranque desde cero

Desde la raíz del repositorio:

```bash
cd services/api
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -e .
python -m uvicorn api.main:app --app-dir src --reload --host 127.0.0.1 --port 8000
```

La API queda disponible en `http://127.0.0.1:8000`; la documentación interactiva está en `http://127.0.0.1:8000/docs`. Para usarla desde `uis/backoffice`, inicia también el frontend en el puerto 3000. Su rewrite reenvía `/api/*` a la API.

## Autenticación y auditoría

- `POST /auth/login` (formulario `username`/`password`) devuelve un token JWT Bearer. Requiere `SECRET_KEY` en `.env`.
- Los endpoints de incidencias y `/records/*` exigen `Authorization: Bearer <token>`; sin token o con token inválido responden 401.
- Cada login y cada uso de incidencias se registra en `services/api/audit.log` (una línea JSON por evento: fecha, acción, resultado, id de usuario, IP y ruta). No se registran contraseñas, tokens ni contenido de los CSV. El fichero está en `.gitignore`.

## Endpoints de incidencias

Requieren token Bearer.

- `POST /api/incidents/analyze`: recibe `file` como `multipart/form-data` y devuelve el resumen JSON.
- `GET /api/incidents/results/export`: descarga `resultados_healthcore.csv` con métricas agregadas del último análisis correcto del proceso.

Ejemplo de prueba local (primero obtén el token con un usuario existente):

```bash
TOKEN=$(curl -s -d "username=usuario@ejemplo.com&password=TU_CONTRASENA" http://127.0.0.1:8000/auth/login | python3 -c "import sys,json;print(json.load(sys.stdin)['access_token'])")
curl -H "Authorization: Bearer $TOKEN" -F "file=@../../scripts/incidents-healthcore.csv" http://127.0.0.1:8000/api/incidents/analyze
curl -OJ -H "Authorization: Bearer $TOKEN" http://127.0.0.1:8000/api/incidents/results/export
```

Para analizar el CSV de 100 filas desde la línea de comandos, ejecuta desde la raíz del repositorio `scripts/analizar-datos-prueba.sh`. Si respondes `y` a `Export results to CSV? [y / n]`, el resultado se guarda en `results.csv` (columnas `metric,value,percentage`, una fila por métrica) en el directorio actual.

Los datos originales del fichero no se guardan ni se incluyen en el CSV exportado. Para el prototipo, el último resultado vive en memoria y se reinicia al reiniciar el proceso; ejecútalo con un único worker.

## Alcance y seguridad

El análisis sigue el briefing oficial `scripts/incidents-BRIEFING.es.md` y se prueba con `scripts/incidents-healthcore.csv` (100 registros: 94 válidos y 6 inválidos).

### Esquema del CSV

Codificación UTF-8, separador coma y fila de encabezado.

- **Campos:** `incident_id`, `date`, `clinic_id`, `country`, `category`, `description`, `status`, `patient_id` y `satisfaction_score`. Este último es opcional salvo si `status` es `CLOSED`.
- **Clínicas válidas (`clinic_id`, país):** `US-TX-01`, `US-TX-02`, `US-TX-03`, `US-FL-01`, `US-FL-02`, `US-FL-03`, `US-GA-01`, `US-GA-02`, `US-GA-03` (US); `UK-LON-01`, `UK-LON-02`, `UK-MAN-01` (UK). `country` debe coincidir con el de la clínica.
- **Categorías:** `APPOINTMENT`, `BILLING`, `CLINICAL_CARE`, `ACCESSIBILITY`, `ADMINISTRATIVE`.
- **Estados:** `OPEN`, `CLOSED`, `DISCARDED`.
- **Registro inválido:** `clinic_id` faltante o inválido; país que no coincide con la clínica; `category` faltante o inválida; `description` vacía o de menos de 5 caracteres; `patient_id` vacío o fuera del formato `PAT-` más 6 dígitos; `CLOSED` sin `satisfaction_score`; `satisfaction_score` fuera de 1–5 o no numérico. Además se cuentan los estados no válidos (`unknown_status`) y las filas con columnas de más (`malformed_row`).
- **Métricas (sobre registros válidos):** totales, categoría, estado y país con porcentaje, y satisfacción de casos `CLOSED` (casos con puntaje, media con 2 decimales y conteo por puntaje 1–5).

### Privacidad

`patient_id` es información protegida por HIPAA y UK GDPR. Solo se comprueba su formato: nunca se guarda, se imprime, se registra ni se exporta, y tampoco aparece en mensajes de error. Solo se informa del número de registros que incumplen cada regla. `services/api/tests/test_incidents_analysis.py` lo verifica; ejecútalo con `python -m unittest discover -s services/api/tests`.

### Acceso

El acceso requiere autenticación JWT y queda auditado. Solo un `admin` puede crear usuarios (`POST /users`). Los roles `admin` y `user` acceden a incidencias y registros con cualquier token válido. El transporte cifrado (HTTPS) no está implementado. No hay aprobación de Cumplimiento registrada para datos reales ni para el despliegue. Mantén el backend ligado a `127.0.0.1` y no proceses datos reales sensibles.
