# Propuesta de Arquitectura de Backend - HealthCore

## 1. Contexto y Objetivo
HealthCore es una red de 12 clínicas ambulatorias en EE.UU. y Reino Unido. Actualmente, la empresa sufre de una fragmentación crítica: utilizamos dos sistemas de historia clínica electrónica (EHR) distintos que no se comunican, una plataforma de facturación en EE.UU., una hoja de cálculo en Reino Unido, y agendas manuales. No existe una capa de datos compartida.
El objetivo de este backend es unificar el acceso a los datos (pacientes, citas, facturación) y servir como base para las herramientas de IA (predicción de no-shows, asistencia de facturación, etc.), garantizando el cumplimiento estricto de HIPAA y UK GDPR.

## 2. Patrón Arquitectónico Propuesto
**Patrón Elegido:** Monolito Modular con Arquitectura en Capas (Layered Architecture) organizado por Dominios de Negocio (Domain-Driven Design).

**Justificación:**
Dado que el equipo de tecnología es de solo 6 personas (CTO James Osei), proponer microservicios sería un error. Un Monolito Modular es ideal:
1. **Separación de responsabilidades por dominio:** Nuestro sistema tiene áreas muy distintas (Clínica, Facturación, Cumplimiento, RRHH). La arquitectura en capas (Routers -> Services -> Repositories) asegura que la lógica de negocio de facturación (Revenue Cycle) no se mezcle con la lógica clínica.
2. **Seguridad y Auditoría:** Al manejar datos protegidos por HIPAA y GDPR, necesitamos centralizar las reglas de acceso. Una capa de servicio robusta nos permite auditar quién consulta qué dato antes de que llegue a la base de datos.
3. **Integración:** Necesitamos una capa de integración clara que "traduzca" los datos de los dos EHRs (EE.UU. y UK) a un formato estándar unificado para nuestro frontend y modelos de IA.

## 3. Estructura de Carpetas y Módulos (Dominios)
Organizaremos el código por áreas de negocio (Vertical Slicing) para reflejar la estructura de HealthCore.

```text
/app
 ├── main.py                  # Punto de entrada
 ├── core/                    # Configuración, seguridad, middleware de auditoría (GDPR/HIPAA)
 ├── clinical/                # Dominio: Operaciones Clínicas y EHRs
 │   ├── router.py            # Endpoints para historias clínicas unificadas
 │   ├── schemas.py
 │   ├── service.py           # Lógica de unificación US-UK
 │   └── integrations/        # Conectores para los dos sistemas EHR legacy
 ├── appointments/            # Dominio: Experiencia del Paciente
 │   ├── router.py            # Reservas online, gestión de agendas
 │   └── ...
 ├── billing/                 # Dominio: Ciclo de Ingresos
 │   ├── router.py            # Endpoints para reclamaciones (US) y facturación (UK)
 │   └── ...
 ├── compliance/              # Dominio: Cumplimiento y Gobierno
 │   ├── router.py            # Pistas de auditoría, solicitudes de datos de pacientes
 │   └── ...
 └── workforce/               # Dominio: Personas y RRHH
     ├── router.py            # Portal de RRHH, seguimiento de CME
     └── ...
Criterio de separación: Cada carpeta principal es un departamento. Esto permite que si el equipo de Claire (Cumplimiento) pide un cambio en la auditoría, no afecte la lógica de facturación de Tom.

4. Organización de Routers y Endpoints
Usaremos APIRouter de FastAPI. No crearemos un archivo gigante de rutas.
Cada dominio (ej. billing) tendrá su propio router.py. En main.py, los incluiremos con un prefijo (ej. /api/v1/billing). Esto es vital porque nos permitirá versionar la API a medida que integremos los sistemas legacy.

5. Decisiones Técnicas Iniciales
Seguridad y Autenticación (OAuth2 + JWT): No podemos usar autenticación básica. Implementaremos JWT con roles (Médico, Facturación, Admin) para asegurar que, por ejemplo, el personal de facturación no pueda ver notas clínicas (HIPAA).

Middleware de Auditoría: Configuraremos un middleware global que registre cada petición (quién, qué pidió, cuándo) para cumplir con las pistas de auditoría de GDPR y HIPAA.

CORS: El frontend está separado. Configuraremos CORS estrictamente para permitir solo los dominios de HealthCore.

Patrón Repository: Los endpoints no hablarán directamente con la base de datos. Habrá una capa de repositorio que abstraerá si los datos vienen de nuestra nueva base de datos o directamente de una consulta a los EHRs legacy.

6. Frontend y Backend Separados
Como el frontend y el backend son sistemas separados, debemos tener en cuenta lo siguiente:

Comunicación por API: Se comunicarán exclusivamente mediante peticiones HTTP (API REST) usando formato JSON.

Variables de Entorno: La URL del backend no debe estar escrita en el código del frontend. Debe configurarse mediante variables de entorno, al igual que las credenciales de la base de datos en el backend.

7. Riesgos y Puntos de Atención
Riesgo de Fuga de Datos (Multas HIPAA/GDPR): Si un endpoint expone demasiada información o no valida los roles. Mitigación: Uso estricto de esquemas de Pydantic para validar qué datos salen al frontend, ocultando datos sensibles.

Latencia en la Integración: Si intentamos leer de los EHRs legacy en cada petición, el backend será lentísimo. Mitigación: Implementar una estrategia de caché (Redis) o una base de datos intermedia para los datos que consultamos frecuentemente.

Confusión del Equipo con "Datos de IA": El equipo de IA podría intentar consultar la base de datos de producción directamente para entrenar modelos. Mitigación: Crear un endpoint o módulo específico de analytics que exponga datos anonimizados (sin nombres ni datos personales) exclusivamente para el equipo de IA.