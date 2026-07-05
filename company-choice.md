
# Elección de empresa: HealthCore
## Por qué elegí HealthCore
Elegí HealthCore porque, desde el contexto colombiano, he vivido en carne propia lo que significa no recibir una atención oportuna como paciente. Por eso me interesa trabajar con datos sensibles y regulados, donde los errores no son solo ineficiencias operativas, sino que pueden tener consecuencias reales para las personas. Me atrae que la empresa opere bajo dos marcos legales distintos y complejos —HIPAA en Estados Unidos y UK GDPR en el Reino Unido—, porque me permite entender cómo se gestiona la salud desde perspectivas regulatorias diferentes, añadiendo una capa de responsabilidad técnica y ética que no existe en otros sectores, ya que aquí lo que está en juego es la vida de las personas. Además, los retos de IA descritos en el briefing —documentación clínica asistida, predicción de no-shows, revisión de reclamaciones— no son mejoras opcionales: son sistemas que impactan directamente en la atención al paciente y en la viabilidad financiera de la empresa. Eso hace que el trabajo se sienta con un propósito mucho más claro que en otros dominios.

## Departamentos que más me interesan

### Ciclo de Ingresos y Facturación (Tom Callahan)
Este departamento me llamó la atención porque la tasa de rechazo de reclamaciones en EE.UU. es del 14%, más del doble de la media del sector (5-8%), debido a prácticas de codificación inconsistentes entre sedes y envíos manuales de reclamaciones. Además, en el Reino Unido la facturación combina pago privado y un contrato con el NHS, gestionados por separado y sin visión unificada. Me parece un problema muy concreto, donde un sistema predictivo de IA tendría un impacto medible y directo sobre los ingresos de la empresa.

### Experiencia del Paciente y Acceso (Priya Nair)
Me interesa este departamento porque la red tiene una tasa de no-shows del 22%, lo que representa cerca de 1.8 millones de dólares anuales en citas perdidas, y actualmente no existe ningún sistema proactivo de contacto para prevenirlo. A esto se suma que los pacientes en EE.UU. reservan por teléfono, mientras que en el Reino Unido llaman a recepción, sin ningún sistema de reservas online compartido entre ambos países. Es un problema que combina predicción de riesgo —igual que en facturación— con una experiencia de usuario que afecta directamente la vida de las personas.

## Reto de automatización que más me interesa
Del milestone map, me interesa especialmente el sistema de revisión de reclamaciones asistido por IA que marque los envíos de alto riesgo antes de salir, mencionado en el departamento de Ciclo de Ingresos y Facturación. Este reto conecta directamente con mi idea de agente de IA, descrita a continuación.

## Mi idea de Agente de IA
Propongo un agente de predicción de rechazos de facturación que analice cada reclamación antes de ser enviada a la aseguradora y estime su probabilidad de ser rechazada.

- **Qué haría el agente:** revisaría cada reclamación (claim) antes del envío, comparando los códigos de facturación usados, las notas clínicas asociadas y el historial de rechazos previos por sede y por aseguradora, para asignarle un score de riesgo.
- **Qué información necesitaría:** los códigos de facturación (CPT/ICD), las notas clínicas de la consulta, el historial de reclamaciones rechazadas anteriormente (por sede, tipo de procedimiento y aseguradora), y las reglas específicas de cada aseguradora, cuando estén disponibles.
- **Qué produciría o desencadenaría:** una alerta con el score de riesgo de rechazo, junto con una sugerencia de corrección —por ejemplo, un código de facturación más adecuado o información faltante— antes de que la reclamación se envíe, reduciendo así la tasa actual del 14% de rechazos.

