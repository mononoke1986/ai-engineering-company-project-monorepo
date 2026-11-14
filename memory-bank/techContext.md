# Tech Context: HealthCore Digital
## ¿Cómo está construido nuestro proyecto?
Este es un monorepo (todos los sistemas en un solo lugar).
- `/uis/website`: Aquí va la web pública para los pacientes.
- `/uis/backoffice`: Aquí va el panel de control para los médicos y administradores.
- `/services`: Aquí van las APIs y la lógica del servidor.

## Reglas técnicas
- Usamos HTML, JavaScript y Node.js.
- No se pueden crear carpetas nuevas por fuera de esta estructura.