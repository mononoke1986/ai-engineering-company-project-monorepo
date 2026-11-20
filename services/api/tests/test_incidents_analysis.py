import csv
import io
import json
import os
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[3]
sys.path.insert(0, str(REPO_ROOT / "services" / "api" / "src"))

from api.incidents.analysis import CSVAnalysisError, analyze_csv  # noqa: E402

OFFICIAL_CSV = REPO_ROOT / "scripts" / "incidents-healthcore.csv"
ANALYZE_SCRIPT = REPO_ROOT / "scripts" / "analyze.py"
HEADER = "incident_id,date,clinic_id,country,category,description,status,patient_id,satisfaction_score\n"

# Synthetic IDs used only to prove they never leak; one per invalid patient_id shape.
SENTINEL_IDS = ("PAT-424242", "PAT-12345", "PAT-98765X", "pat-777777", "XPAT-555555")
SYNTHETIC_CSV = HEADER + "".join([
    "HC-000001,2024-01-01,US-TX-01,US,BILLING,Valid billing dispute,CLOSED,PAT-424242,4\n",
    "HC-000002,2024-01-02,US-TX-01,US,BILLING,Bad patient format,OPEN,PAT-12345,\n",
    "HC-000003,2024-01-03,UK-LON-01,UK,APPOINTMENT,Bad patient format,OPEN,PAT-98765X,\n",
    "HC-000004,2024-01-04,UK-LON-01,US,APPOINTMENT,Country mismatch,OPEN,pat-777777,\n",
    "HC-000005,2024-01-05,XX-000,UK,BILLING,Unknown clinic,CLOSED,XPAT-555555,9\n",
])


def official_patient_ids() -> set[str]:
    with OFFICIAL_CSV.open(encoding="utf-8", newline="") as handle:
        return {row["patient_id"].strip() for row in csv.DictReader(handle) if row["patient_id"].strip()}


def run_cli(csv_path: Path, answer: str, cwd: Path) -> subprocess.CompletedProcess:
    return subprocess.run(
        [sys.executable, str(ANALYZE_SCRIPT), str(csv_path)],
        input=answer + "\n",
        capture_output=True,
        text=True,
        cwd=cwd,
        env={**os.environ, "PYTHONDONTWRITEBYTECODE": "1"},
        check=False,
    )


class OfficialDatasetTest(unittest.TestCase):
    def test_matches_briefing_values(self):
        result = analyze_csv(OFFICIAL_CSV.read_bytes())

        self.assertEqual((result.total_records, result.valid_records, result.invalid_records), (100, 94, 6))
        self.assertEqual(result.invalid_by_rule, {
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
        self.assertEqual(result.categories, {
            "APPOINTMENT": 30, "BILLING": 20, "CLINICAL_CARE": 14, "ACCESSIBILITY": 17, "ADMINISTRATIVE": 13,
        })
        self.assertEqual(result.statuses, {"OPEN": 28, "CLOSED": 52, "DISCARDED": 14})
        self.assertEqual(result.countries, {"US": 61, "UK": 33})
        self.assertEqual((result.scored_cases, result.closed_cases), (52, 52))
        self.assertEqual(result.average_score, 3.58)
        self.assertEqual(result.score_distribution, {1: 3, 2: 5, 3: 12, 4: 23, 5: 9})


class PatientIdPrivacyTest(unittest.TestCase):
    def assert_no_patient_ids(self, text: str, patient_ids) -> None:
        for patient_id in patient_ids:
            self.assertNotIn(patient_id, text)
        self.assertNotIn("PAT-", text.upper())

    def test_result_dict_and_export_contain_no_patient_ids(self):
        for content, ids in (
            (OFFICIAL_CSV.read_bytes(), official_patient_ids()),
            (SYNTHETIC_CSV.encode(), SENTINEL_IDS),
        ):
            result = analyze_csv(content)
            self.assert_no_patient_ids(json.dumps(result.to_dict()), ids)
            self.assert_no_patient_ids(result.to_csv(), ids)
            self.assert_no_patient_ids(repr(result), ids)

    def test_synthetic_invalid_ids_are_counted_not_shown(self):
        result = analyze_csv(SYNTHETIC_CSV)
        self.assertEqual(result.invalid_by_rule["missing_patient_id"], 4)
        self.assertEqual(result.valid_records, 1)

    def test_error_messages_contain_no_patient_ids(self):
        broken_inputs = (
            HEADER + 'HC-000001,2024-01-01,US-TX-01,US,BILLING,"Unclosed quote,OPEN,PAT-424242,\n',
            HEADER.replace("patient_id,", "") + "HC-000001,2024-01-01,US-TX-01,US,BILLING,Text here,OPEN,PAT-424242\n",
            "PAT-424242,PAT-424242\n",
        )
        for content in broken_inputs:
            with self.assertRaises(CSVAnalysisError) as context:
                analyze_csv(content)
            self.assert_no_patient_ids(str(context.exception), SENTINEL_IDS)
            self.assertIsNone(context.exception.__cause__)

    def test_cli_console_and_results_csv_contain_no_patient_ids(self):
        with tempfile.TemporaryDirectory() as tmp:
            tmp_path = Path(tmp)
            synthetic = tmp_path / "synthetic.csv"
            synthetic.write_text(SYNTHETIC_CSV, encoding="utf-8")
            cases = (
                (OFFICIAL_CSV, official_patient_ids()),
                (synthetic, SENTINEL_IDS),
            )
            for csv_path, ids in cases:
                completed = run_cli(csv_path, "y", tmp_path)
                self.assertEqual(completed.returncode, 0, completed.stderr)
                self.assert_no_patient_ids(completed.stdout + completed.stderr, ids)
                exported = (tmp_path / "results.csv").read_text(encoding="utf-8")
                self.assert_no_patient_ids(exported, ids)

            broken = tmp_path / "broken.csv"
            broken.write_text(
                HEADER + 'HC-000001,2024-01-01,US-TX-01,US,BILLING,"Unclosed,OPEN,PAT-424242,\n',
                encoding="utf-8",
            )
            completed = run_cli(broken, "y", tmp_path)
            self.assertEqual(completed.returncode, 1)
            self.assert_no_patient_ids(completed.stdout + completed.stderr, SENTINEL_IDS)


class ExportFormatTest(unittest.TestCase):
    def test_one_row_per_metric(self):
        rows = list(csv.reader(io.StringIO(analyze_csv(OFFICIAL_CSV.read_bytes()).to_csv())))
        self.assertEqual(rows[0], ["metric", "value", "percentage"])
        metrics = [row[0] for row in rows[1:]]
        self.assertEqual(len(metrics), len(set(metrics)))
        exported = {row[0]: row[1:] for row in rows[1:]}
        self.assertEqual(exported["total_records"], ["100", ""])
        self.assertEqual(exported["invalid_missing_clinic_id"], ["1", ""])
        self.assertEqual(exported["category_APPOINTMENT"], ["30", "31.9"])
        self.assertEqual(exported["status_OPEN"], ["28", "29.8"])
        self.assertEqual(exported["country_US"], ["61", "64.9"])
        self.assertEqual(exported["avg_satisfaction"], ["3.58", ""])
        self.assertEqual(exported["score_4"], ["23", ""])


if __name__ == "__main__":
    unittest.main()
