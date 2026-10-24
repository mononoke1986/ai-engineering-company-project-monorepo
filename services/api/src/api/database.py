from pathlib import Path
from tinydb import TinyDB

DB_PATH = Path(__file__).resolve().parents[2] / "db.json"
db = TinyDB(DB_PATH)
