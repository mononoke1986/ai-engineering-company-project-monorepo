import pandas as pd
import sys

# 1. Recibimos el archivo desde la terminal
ruta_archivo = sys.argv[1]

try:
    # Leemos el archivo CSV
    datos = pd.read_csv(ruta_archivo)
    print("¡Archivo leído con éxito! 🎉\n")

    # 2. Definimos las reglas (según el Briefing)
    estados_validos = ['abierto', 'cerrado', 'descartado']
    columnas_obligatorias = ['id_incidencia', 'departamento', 'categoria', 'estado']

    # 3. Buscamos errores (Registros inválidos)
    registros_invalidos = datos[
        datos[columnas_obligatorias].isnull().any(axis=1) | # Si falta un dato obligatorio
        ~datos['estado'].isin(estados_validos)              # Si el estado no es válido
    ]
    
    # Los válidos son el resto
    registros_validos = datos.drop(registros_invalidos.index)

    # 4. Mostramos el resumen
    print(f"Total de incidencias procesadas: {len(datos)}")
    print(f"✅ Incidencias válidas: {len(registros_validos)}")
    print(f"❌ Incidencias inválidas: {len(registros_invalidos)}\n")

    # Si hay inválidos, mostramos cuáles son
    if len(registros_invalidos) > 0:
        print("⚠️ Detalle de los registros inválidos:")
        print(registros_invalidos)
        print("\n")

    # 5. Calculamos las métricas (solo con los válidos)
    print("--- MÉTRICAS ---")
    
    # Total por categoría
    print("\nTotal por categoría:")
    print(registros_validos['categoria'].value_counts())
    
    # Total por estado
    print("\nTotal por estado:")
    print(registros_validos['estado'].value_counts())
    
    # Índice de satisfacción (solo de los que están 'cerrado')
    cerrados = registros_validos[registros_validos['estado'] == 'cerrado']
    if not cerrados.empty:
        promedio_satisfaccion = cerrados['satisfaccion'].mean()
        print(f"\nÍndice de satisfacción en casos cerrados: {promedio_satisfaccion:.2f} / 5")

    # 6. Preguntar si quiere exportar
    respuesta = input("\n¿Deseas exportar los resultados a un CSV? (s / n): ")
    if respuesta.lower() == 's':
        # Aquí guardamos el archivo
        registros_validos.to_csv('results.csv', index=False)
        print("¡Archivo 'results.csv' guardado con éxito en tu carpeta! 📁")

except Exception as e:
    print(f"¡Ups! Hubo un error: {e}")