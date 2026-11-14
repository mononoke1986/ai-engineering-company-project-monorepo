from flask import Flask, request, jsonify, send_file
import pandas as pd
import os

app = Flask(__name__)

# Esta línea encuentra la carpeta exacta donde está este archivo (services/api)
CARPETA_ACTUAL = os.path.dirname(os.path.abspath(__file__))
RUTA_CSV = os.path.join(CARPETA_ACTUAL, 'resultados_guardados.csv')

@app.route('/')
def inicio():
    return "¡Hola! El mesero (API) está listo y esperando archivos. 🍽️"

@app.route('/api/incidents/analyze', methods=['POST'])
def analizar_incidencias():
    if 'file' not in request.files:
        return jsonify({"error": "¡No enviaste ningún archivo!"}), 400
    
    archivo = request.files['file']
    if archivo.filename == '':
        return jsonify({"error": "El archivo está vacío"}), 400

    try:
        datos = pd.read_csv(archivo)
        
        estados_validos = ['abierto', 'cerrado', 'descartado']
        columnas_obligatorias = ['id_incidencia', 'departamento', 'categoria', 'estado']
        
        invalidos = datos[
            datos[columnas_obligatorias].isnull().any(axis=1) | 
            ~datos['estado'].isin(estados_validos)
        ]
        validos = datos.drop(invalidos.index)
        
        # Guardamos usando la ruta exacta
        validos.to_csv(RUTA_CSV, index=False)

        categorias = validos['categoria'].value_counts().to_dict()
        estados = validos['estado'].value_counts().to_dict()
        
        cerrados = validos[validos['estado'] == 'cerrado']
        satisfaccion = float(cerrados['satisfaccion'].mean()) if not cerrados.empty else 0.0

        respuesta = {
            "total_procesados": len(datos),
            "validos": len(validos),
            "invalidos": len(invalidos),
            "por_categoria": categorias,
            "por_estado": estados,
            "satisfaccion_cerrados": round(satisfaccion, 2)
        }
        return jsonify(respuesta), 200

    except Exception as e:
        return jsonify({"error": f"Hubo un problema: {str(e)}"}), 500

@app.route('/api/incidents/results/export', methods=['GET'])
def exportar_resultados():
    # Buscamos el archivo en la ruta exacta
    if os.path.exists(RUTA_CSV):
        return send_file(RUTA_CSV, mimetype='text/csv', as_attachment=True, download_name='resultados_healthcore.csv')
    else:
        return jsonify({"error": "Primero debes analizar un archivo."}), 400

if __name__ == '__main__':
    app.run(debug=True, port=5000)