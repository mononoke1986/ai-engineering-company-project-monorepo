### CONTEXTO
Tengo un archivo index.html con la estructura HTML5 semántica completa 
de la landing page de HealthCore, una red de clínicas de salud ambulatoria. 
El archivo ya tiene: header con nav y selector de idioma, hero, sección 
de servicios (3 articles), sección "Why HealthCore" (2 articles), 
tabla de ubicaciones, sección de contacto con <address>, footer con 
redes sociales, y dos bloques Schema.org en el <head>.

Esta es la versión en inglés. Habrá una versión en español después, 
pero por ahora solo trabajamos en este archivo.


### RESTRICCIONES
No cambies NINGÚN texto, dato, teléfono, nombre de clínica, horario, 
ni la estructura semántica existente (header, nav, main, section, 
article, table, thead, tbody, address, footer).
No toques los bloques <script type="application/ld+json"> del <head>.
No agregues ni elimines elementos HTML — solo añade atributos class 
con clases de Tailwind a los elementos que ya existen.
Usa Tailwind CSS vía CDN (agrega el <script src="https://cdn.tailwindcss.com"> 
en el <head> si no está ya).
Diseño mobile-first: los estilos base deben funcionar en móvil, 
y usa breakpoints sm:, md:, lg: para tablet y escritorio.
Paleta de colores apropiada para una empresa de salud: azules y verdes 
suaves que transmitan confianza y profesionalismo, NO colores llamativos 
tipo e-commerce.
Todos los enlaces y botones deben tener estados hover y focus visibles 
(focus visible es requisito de accesibilidad).
El header debe ser sticky (fijo arriba al hacer scroll).
La tabla de ubicaciones debe ser legible en mobile: usa overflow-x-auto 
en un contenedor envolvente para permitir scroll horizontal si es necesario, 
sin romper la tabla semántica.


### TAREA
Aplica clases de Tailwind a cada sección existente:

1. Header: fondo blanco o color de marca, sticky top-0, nav horizontal 
   en desktop, logo destacado con tipografía fuerte, selector de idioma 
   visualmente diferenciado.

2. Hero (#home): título grande y con peso fuerte (text-4xl o mayor en 
   desktop), subtítulo con buen contraste de tamaño respecto al título, 
   botón CTA "Request an Appointment" con estilo de botón prominente 
   (padding generoso, fondo de color de marca, rounded, hover state).

3. Services (#services): grid de 3 columnas en desktop (grid-cols-3), 
   1 columna en mobile (grid-cols-1), cada article como card con 
   padding, sombra sutil y bordes redondeados.

4. Why HealthCore: grid de 2 columnas en desktop, 1 en mobile.

5. Locations (#locations): tabla con buen espaciado en celdas, 
   encabezados de tabla con fondo diferenciado, filas con hover state, 
   contenedor con overflow-x-auto para mobile.

6. Contact (#contact): lista de contacto con buen espaciado e íconos 
   opcionales antes de cada línea (puedes omitir íconos si prefieres 
   mantenerlo simple).

7. Footer: fondo oscuro o de color de marca, texto claro, enlaces 
   de redes sociales con buen espaciado horizontal.


### FORMATO DE SALIDA
Devuelve el archivo HTML completo con las clases de Tailwind ya 
aplicadas a cada elemento existente, conservando el 100% del contenido, 
comentarios y estructura semántica original.