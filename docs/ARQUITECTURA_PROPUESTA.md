# Propuesta de Arquitectura de Backend

## 1. Contexto y Objetivo
El objetivo de este documento es definir la arquitectura para el backend del sitio corporativo de [Escribe el nombre de tu empresa o proyecto, ej: TechNova]. Actualmente, el frontend ya está desplegado. Ahora necesitamos construir un backend robusto que gestione los datos de los usuarios, [menciona 1 o 2 cosas más, ej: los pedidos, los productos], y se comunique de forma segura con el frontend.

## 2. Patrón Arquitectónico Propuesto
**Patrón Elegido:** Arquitectura en Capas (Layered Architecture) combinada con una organización por dominios.

**Justificación:** 
No elegimos este patrón por moda, sino porque se adapta a la naturaleza de nuestro negocio. Nuestro sistema maneja diferentes áreas (como usuarios y datos corporativos). La arquitectura en capas nos permite separar las responsabilidades de la misma forma en que funciona un restaurante:
- **Capa de API (Routers):** Son los meseros, reciben el pedido del cliente (el frontend).
- **Capa de Servicio (Services):** Es el chef, contiene la lógica y las reglas del negocio.
- **Capa de Repositorio (Repositories):** Es la despensa, se encarga de guardar y buscar los datos en la base de datos.
Esto garantiza que, si el día de mañana cambiamos la base de datos, no tengamos que romper la lógica de negocio ni los endpoints.

## 3. Estructura de Carpetas Propuesta
Para evitar que el proyecto sea un caos, organizaremos el código por **dominios** (Feature-based), no por tipos de archivos. 

```text
/app
 ├── main.py              # Punto de entrada de la app
 ├── core/                # Configuración global (seguridad, base de datos)
 │   ├── config.py
 │   └── database.py
 ├── users/               # Dominio: Usuarios
 │   ├── router.py        # Endpoints de usuarios
 │   ├── schemas.py       # Modelos de validación (Pydantic)
 │   ├── models.py        # Modelos de base de datos
 │   ├── service.py       # Lógica de negocio
 │   └── repository.py    # Consultas a la base de datos
 ├── [otro_dominio]/      # Ejemplo: pedidos, productos, etc.
 │   ├── router.py
 │   └── ...