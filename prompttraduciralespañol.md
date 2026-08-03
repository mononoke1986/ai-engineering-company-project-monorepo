### CONTEXTO
Ya tengo index.html completo (landing page de HealthCore en inglés, 
con Tailwind CSS aplicado, estructura semántica, Schema.org, y grids 
responsive para Services y Why HealthCore).

Ahora necesito crear index.es.html: la MISMA página, con el MISMO 
diseño, estructura HTML y clases de Tailwind, pero con TODO el 
contenido traducido al español.


### RESTRICCIONES
Copia exactamente la misma estructura HTML, las mismas clases de 
Tailwind, el mismo Schema.org (pero traduce los valores de texto 
dentro del JSON-LD que sean visibles/descriptivos, como "description", 
manteniendo los datos técnicos como teléfonos, URLs y @type sin cambios).
Los enlaces de navegación de idioma deben invertirse: en index.es.html, 
el enlace "ES" debe apuntar a index.es.html y mostrarse como activo 
(aria-current="page"), y el enlace "EN" debe apuntar a index.html.
Los enlaces <a href="tel:..."> y <a href="mailto:..."> deben mantener 
el mismo número/correo, solo cambia el texto visible si aplica.
El botón que enlaza al formulario debe apuntar a application.es.html 
(la versión en español del formulario, que crearemos después).
No dejes NINGÚN texto en inglés visible para el usuario.
Usa los siguientes textos exactos en español para cada sección:

NAVEGACIÓN: Inicio | Servicios | Ubicaciones | Contacto

HERO:
- Título: "Atención médica que se adapta a tu vida"
- Subtítulo: "12 clínicas ambulatorias en EE. UU. y Reino Unido que 
  ofrecen citas el mismo día, horarios extendidos y atención bilingüe, 
  para que recibas la atención que necesitas, cuando la necesitas."
- Botón: "Solicitar una cita"

SERVICIOS (mismo título de sección: "Servicios"):
1. "Atención Primaria y Enfermedades Crónicas"
   - Citas el mismo día con médicos de atención primaria
   - Manejo continuo de diabetes, hipertensión y asma
2. "Consultas con Especialistas"
   - Cardiología, endocrinología, neumología y salud de la mujer
   - Derivaciones coordinadas dentro de la red de HealthCore
3. "Salud Preventiva y Bienestar"
   - Chequeos, vacunación y revisiones anuales
   - Asesoramiento en salud mental y derivaciones a psiquiatría

POR QUÉ HEALTHCORE (título de sección: "Por qué HealthCore"):
- Citas el mismo día en la mayoría de las ubicaciones
- Horarios extendidos: entre semana hasta las 7pm u 8pm, sábados disponibles
- Personal bilingüe en inglés y español en ubicaciones de EE. UU.
- 12 clínicas en Texas, Florida, Georgia y el Reino Unido

UBICACIONES (título de sección: "Nuestras Ubicaciones"):
Mantén los mismos nombres de clínica, ciudades, estados, teléfonos 
y horarios EXACTAMENTE igual que en index.html (son datos fijos, no 
se traducen). Solo traduce los encabezados de la tabla:
Nombre de la Clínica | Ciudad | Estado | Teléfono | Horario
Y el texto sobre Reino Unido: "Las clínicas del Reino Unido atienden 
un mercado independiente y no se incluyen en este sitio web público."

CONTACTO (título de sección: "Contacto"):
- Consultas generales: info@healthcore.com
- Sede central de Austin: (512) 340-8800
- Miami: (305) 510-7700
- Reino Unido (Londres): +44 20 7946 0100

FOOTER:
© 2025 HealthCore. Todos los derechos reservados.
(mantén LinkedIn, Facebook, Instagram sin traducir, son nombres propios)


### FORMATO DE SALIDA
Un archivo HTML5 completo, listo para guardar como index.es.html.