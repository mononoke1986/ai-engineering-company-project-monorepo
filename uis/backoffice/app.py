import streamlit as st
import requests

# Título de la página
st.title("🏥 Analizador de Incidencias - HealthCore")
st.write("Sube el archivo CSV de incidencias para analizarlo.")

# El botón para arrastrar y soltar archivos
archivo_subido = st.file_uploader("Elige tu archivo CSV", type="csv")

if archivo_subido is not None:
    if st.button("🚀 Analizar Archivo"):
        with st.spinner("Analizando... ¡El mesero está llevando el archivo al chef!"):
            # Preparamos el archivo para enviarlo a la API
            archivos = {'file': (archivo_subido.name, archivo_subido, 'text/csv')}
            
            try:
                # Hacemos la petición a nuestra API (Backend)
                respuesta = requests.post("http://localhost:5000/api/incidents/analyze", files=archivos)
                
                if respuesta.status_code == 200:
                    datos = respuesta.json()
                    st.success("¡Análisis completado con éxito! 🎉")
                    
                    # Mostramos los números en columnas bonitas
                    col1, col2, col3 = st.columns(3)
                    col1.metric("Total Procesados", datos['total_procesados'])
                    col2.metric("Válidos ✅", datos['validos'])
                    col3.metric("Inválidos ❌", datos['invalidos'])
                    
                    # Mostramos los detalles
                    st.subheader("📊 Desglose por Categoría")
                    st.write(datos['por_categoria'])
                    
                    st.subheader("📌 Desglose por Estado")
                    st.write(datos['por_estado'])
                    
                    st.subheader("⭐ Satisfacción (Casos Cerrados)")
                    st.write(f"{datos['satisfaccion_cerrados']} / 5")
                    
                    # --- PARTE NUEVA: BOTÓN DE DESCARGA ---
                    st.markdown("---")
                    st.subheader("📥 Exportar Resultados")
                    
                    try:
                        # Le pedimos el archivo CSV a la API
                        respuesta_csv = requests.get("http://localhost:5000/api/incidents/results/export")
                        
                        if respuesta_csv.status_code == 200:
                            st.download_button(
                                label="Descargar Resultados en CSV",
                                data=respuesta_csv.content,
                                file_name='resultados_healthcore.csv',
                                mime='text/csv',
                            )
                        else:
                            # Si la API da error, lo mostramos en pantalla
                            st.error(f"Error {respuesta_csv.status_code}: {respuesta_csv.text}")
                    except Exception as e:
                        st.error(f"No se pudo conectar para descargar: {e}")
                    # --------------------------------------
                    
                else:
                    st.error("Hubo un error al procesar el archivo.")
            except Exception as e:
                st.error(f"No se pudo conectar con el servidor. ¿Está encendido? Error: {e}")