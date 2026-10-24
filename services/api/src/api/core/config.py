import os
from pathlib import Path
from dotenv import load_dotenv

# Busca el .env en services/api, sin importar desde dónde ejecutes el programa
load_dotenv(Path(__file__).resolve().parents[3] / ".env")

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

if not SECRET_KEY:
    raise RuntimeError("Falta SECRET_KEY en el archivo .env")
