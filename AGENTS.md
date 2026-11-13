# Reglas para el Agente de IA (HealthCore)
¡Hola, agente! Antes de tocar cualquier código, sigue estas reglas:

## 1. Lectura obligatoria
Al iniciar cada sesión, debes leer todos los archivos de la carpeta `memory-bank/`.

## 2. Flujo obligatorio antes de guardar (Commit)
No puedes hacer un commit sin seguir estos 4 pasos:
1. Revisar que el código no tenga errores de sintaxis.
2. Actualizar el archivo `memory-bank/progress.md` con lo que se hizo hoy.
3. Pedir confirmación al desarrollador (yo) sobre los cambios.
4. Hacer el commit con un mensaje claro.

## 3. Dónde va el código
- NO inventes carpetas nuevas.
- La web pública va en `/uis/website`.
- El panel interno va en `/uis/backoffice`.
- Los servicios van en `/services`.

## 4. Qué NO tocar
- No modifiques la carpeta `memory-bank` sin mi permiso.
- No toques archivos de configuración de seguridad sin avisar.