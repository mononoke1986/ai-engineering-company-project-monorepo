### CONTEXTO
Estoy construyendo la landing page pública de HealthCore, una red de 
clínicas de salud ambulatoria con sede en Austin, Texas. Fundada en 2011, 
opera 12 clínicas (9 en EE.UU.: Texas, Florida, Georgia; 3 en Reino Unido, 
que NO se muestran en este sitio público).

Este archivo es SOLO la versión en inglés (index.html). Habrá una versión 
en español (index.es.html) después, pero por ahora trabajamos solo en inglés.

Datos exactos que debes usar (no inventes nada):

HERO:
- Headline: "Healthcare that fits your life"
- Subheadline: "12 outpatient clinics across the U.S. and U.K. offering 
  same-day appointments, extended hours, and bilingual care, so you get 
  the care you need, when you need it."
- CTA button: "Request an Appointment" que enlace a application.html

SERVICIOS (3 columnas):
1. Primary Care & Chronic Disease Management
   - Same-day appointments with primary care physicians
   - Ongoing management of diabetes, hypertension, and asthma
2. Specialist Consultations
   - Cardiology, endocrinology, pulmonology, and women's health
   - Coordinated referrals within the HealthCore network
3. Preventive Health & Wellness
   - Check-ups, vaccinations, and annual screenings
   - Mental health counseling and psychiatric referrals

WHY HEALTHCORE (2 columnas):
- Same-day appointments at most locations
- Extended hours: weekdays until 7pm or 8pm, Saturdays available
- Bilingual staff (English and Spanish) at U.S. locations
- 12 clinics across Texas, Florida, Georgia, and the U.K.

UBICACIONES (tabla, solo EE.UU.):
| Clinic Name | City | State | Phone | Hours |
| HealthCore Austin Central | Austin | TX | (512) 340-8800 | Mon–Fri 7am–8pm · Sat 9am–3pm |
| HealthCore Austin North | Austin | TX | (512) 340-8810 | Mon–Fri 8am–7pm |
| HealthCore San Antonio | San Antonio | TX | (210) 720-4400 | Mon–Fri 8am–6pm · Sat 9am–1pm |
| HealthCore Miami | Miami | FL | (305) 510-7700 | Mon–Fri 7am–8pm · Sat 9am–4pm |
| HealthCore Orlando | Orlando | FL | (407) 892-6600 | Mon–Fri 8am–6pm |
| HealthCore Atlanta | Atlanta | GA | (404) 330-9900 | Mon–Fri 8am–7pm |

Nota: agrega un texto indicando que las clínicas del Reino Unido 
sirven un mercado independiente y no aparecen en este sitio.

CONTACTO:
- General inquiries: info@healthcore.com
- Austin HQ: (512) 340-8800
- Miami: (305) 510-7700
- United Kingdom (London): +44 20 7946 0100
FOOTER:
- © 2025 HealthCore. All rights reserved.
- Enlaces a LinkedIn, Facebook, Instagram (usa "#" como href por ahora)
### RESTRICCIONES
Usa exactamente estos datos, sin inventar nombres, teléfonos ni servicios.
Usa HTML5 semántico: <header>, <nav>, <main>, <section>, <article>, 
<table>, <footer> (no divs genéricos para estructura).
Cada <section> debe tener un heading (<h1>/<h2>) y usar aria-labelledby 
apuntando a ese heading.
La tabla de ubicaciones debe usar <table>, <caption>, <thead>, <tbody> 
y <th scope="col"> correctamente (no una lista de divs).
Los teléfonos deben ser enlaces <a href="tel:...">.
El email debe ser un enlace <a href="mailto:...">.
Incluye en el <head> dos bloques <script type="application/ld+json">: 
uno con datos de MedicalOrganization para HealthCore, y otro (array) 
con un MedicalClinic por cada una de las 6 clínicas de la tabla, 
usando name, telephone, openingHours y parentOrganization.
NO apliques Tailwind ni ningún estilo CSS todavía — solo estructura 
HTML semántica pura, ese paso es después.
El header debe incluir: logo/nombre "HealthCore", navegación 
(Home, Services, Locations, Contact), y un selector de idioma 
(EN | ES) con enlaces a index.html e index.es.html.

### FORMATO DE SALIDA
Un archivo HTML5 completo (doctype, head, body), listo para guardar 
como index.html.
