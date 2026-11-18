import json
import os
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path
from unittest import mock

os.environ.setdefault("SECRET_KEY", "test-only-secret")

REPO_ROOT = Path(__file__).resolve().parents[3]
sys.path.insert(0, str(REPO_ROOT / "services" / "api" / "src"))

from fastapi.testclient import TestClient  # noqa: E402

from api.core import audit as audit_module  # noqa: E402
from api.core.deps import get_current_user  # noqa: E402
from api.incidents import router as incidents_router  # noqa: E402
from api.main import app  # noqa: E402

OFFICIAL_CSV = REPO_ROOT / "scripts" / "incidents-healthcore.csv"
ANALYZE_SCRIPT = REPO_ROOT / "scripts" / "analyze.py"
ANALYZE_URL = "/api/incidents/analyze"
EXPORT_URL = "/api/incidents/results/export"
LEAKY_ROW = "HC-000001,2024-01-01,US-TX-01,US,BILLING,Valid billing dispute,OPEN,PAT-424242,\n"


def patient_ids() -> set[str]:
    import csv

    with OFFICIAL_CSV.open(encoding="utf-8", newline="") as handle:
        ids = {row["patient_id"].strip() for row in csv.DictReader(handle) if row["patient_id"].strip()}
    return ids | {"PAT-424242"}


class IncidentsApiTest(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.audit_path = Path(self.tmp.name) / "audit.log"
        patcher = mock.patch.object(audit_module, "AUDIT_LOG_PATH", self.audit_path)
        patcher.start()
        self.addCleanup(patcher.stop)
        self.addCleanup(self.tmp.cleanup)

        incidents_router.latest_result = None
        app.dependency_overrides[get_current_user] = lambda: {"id": "test-user", "role": "user"}
        self.addCleanup(app.dependency_overrides.clear)
        self.client = TestClient(app)
        self.responses: list[str] = []

    def post(self, files=None):
        response = self.client.post(ANALYZE_URL, files=files)
        self.responses.append(response.text)
        return response

    def upload(self, name: str, content: bytes, content_type: str = "text/csv"):
        return self.post(files={"file": (name, content, content_type)})

    def assert_error(self, response, status: int, message: str):
        self.assertEqual(response.status_code, status)
        self.assertEqual(response.json(), {"detail": message})

    def test_analyze_returns_official_numbers(self):
        response = self.upload("incidents-healthcore.csv", OFFICIAL_CSV.read_bytes())

        self.assertEqual(response.status_code, 200)
        body = response.json()
        self.assertEqual(
            (body["total_records"], body["valid_records"], body["invalid_records"]), (100, 94, 6)
        )
        self.assertEqual(body["invalid_by_rule"], {
            "missing_clinic_id": 1,
            "country_mismatch": 1,
            "missing_category": 1,
            "empty_description": 1,
            "missing_patient_id": 1,
            "closed_without_score": 1,
            "score_out_of_range": 0,
            "unknown_status": 0,
            "malformed_row": 0,
        })
        self.assertEqual(
            {key: value["count"] for key, value in body["categories"].items()},
            {"APPOINTMENT": 30, "BILLING": 20, "CLINICAL_CARE": 14, "ACCESSIBILITY": 17, "ADMINISTRATIVE": 13},
        )
        self.assertEqual(body["categories"]["APPOINTMENT"]["percentage"], 31.9)
        self.assertEqual(
            {key: value["count"] for key, value in body["statuses"].items()},
            {"OPEN": 28, "CLOSED": 52, "DISCARDED": 14},
        )
        self.assertEqual(
            {key: value["count"] for key, value in body["countries"].items()}, {"US": 61, "UK": 33}
        )
        self.assertEqual(body["satisfaction"], {
            "closed_cases": 52,
            "scored_cases": 52,
            "average_score": 3.58,
            "score_distribution": {"1": 3, "2": 5, "3": 12, "4": 23, "5": 9},
        })

    def test_export_matches_cli_results_csv(self):
        self.upload("incidents-healthcore.csv", OFFICIAL_CSV.read_bytes())
        response = self.client.get(EXPORT_URL)

        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.headers["content-type"].startswith("text/csv"))
        self.assertTrue(response.content.startswith(b"metric,value,percentage\r\n"))

        cli_dir = Path(self.tmp.name) / "cli"
        cli_dir.mkdir()
        completed = subprocess.run(
            [sys.executable, str(ANALYZE_SCRIPT), str(OFFICIAL_CSV)],
            input="y\n",
            capture_output=True,
            text=True,
            cwd=cli_dir,
            env={**os.environ, "PYTHONDONTWRITEBYTECODE": "1"},
            check=False,
        )
        self.assertEqual(completed.returncode, 0, completed.stderr)
        self.assertEqual(response.content, (cli_dir / "results.csv").read_bytes())

    def test_empty_csv(self):
        self.assert_error(self.upload("vacio.csv", b""), 400, "El fichero CSV está vacío.")

    def test_header_only_csv(self):
        header = b"incident_id,date,clinic_id,country,category,description,status,patient_id,satisfaction_score\n"
        self.assert_error(
            self.upload("cabecera.csv", header), 400, "El CSV no contiene registros para analizar."
        )

    def test_non_csv_files(self):
        message = "El fichero debe tener extensión .csv."
        self.assert_error(self.upload("foto.png", b"\x89PNG\r\n\x1a\n", "image/png"), 400, message)
        self.assert_error(self.upload("datos.txt", OFFICIAL_CSV.read_bytes(), "text/plain"), 400, message)

    def test_csv_extension_with_binary_content(self):
        self.assert_error(
            self.upload("falso.csv", b"\x89PNG\r\n\x1a\n\xff\xfe\x00", "text/csv"),
            400,
            "El fichero debe estar codificado en UTF-8.",
        )

    def test_missing_required_columns(self):
        response = self.upload("columnas.csv", b"patient_id,otra\nPAT-424242,x\n")
        self.assert_error(
            response,
            400,
            "Faltan columnas obligatorias: incident_id, date, clinic_id, country, category, description, status",
        )

    def test_request_without_file(self):
        self.assert_error(self.post(), 400, "Debes seleccionar un fichero CSV.")

    def test_export_before_analyzing(self):
        response = self.client.get(EXPORT_URL)
        self.responses.append(response.text)
        self.assert_error(response, 404, "Todavía no hay resultados. Analiza un CSV primero.")

    def test_failed_analysis_keeps_previous_result(self):
        self.upload("incidents-healthcore.csv", OFFICIAL_CSV.read_bytes())
        self.upload("vacio.csv", b"")
        self.assertEqual(self.client.get(EXPORT_URL).status_code, 200)

    def test_endpoints_require_token(self):
        app.dependency_overrides.clear()
        self.assertEqual(self.client.post(ANALYZE_URL, files={"file": ("a.csv", b"x", "text/csv")}).status_code, 401)
        self.assertEqual(self.client.get(EXPORT_URL).status_code, 401)

    def test_no_patient_id_in_responses_or_audit_log(self):
        content = OFFICIAL_CSV.read_bytes()
        self.upload("incidents-healthcore.csv", content)
        self.client.get(EXPORT_URL)
        self.upload("columnas.csv", b"patient_id,otra\nPAT-424242,x\n")
        self.upload("roto.csv", ("incident_id,date,clinic_id,country,category,description,status,patient_id\n"
                                 + LEAKY_ROW + '"sin cerrar,PAT-424242\n').encode())
        self.upload("falso.csv", b"PAT-424242\xff\xfe")
        self.upload("datos.txt", LEAKY_ROW.encode(), "text/plain")

        audit_text = self.audit_path.read_text(encoding="utf-8")
        self.assertTrue(audit_text.strip(), "el log de auditoría no debería estar vacío")
        for line in audit_text.splitlines():
            json.loads(line)
        for text in [*self.responses, audit_text]:
            self.assertNotIn("PAT-", text)
            for patient_id in patient_ids():
                self.assertNotIn(patient_id, text)


if __name__ == "__main__":
    unittest.main()
