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