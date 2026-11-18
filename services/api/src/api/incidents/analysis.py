"""Incident analysis per scripts/incidents-BRIEFING.es.md; patient_id is only format-checked, never kept."""

import csv
import io
import re
from collections import Counter
from dataclasses import dataclass
from typing import Any


REQUIRED_COLUMNS = (
    "incident_id",
    "date",
    "clinic_id",
    "country",
    "category",
    "description",
    "status",
    "patient_id",
)
CLINIC_COUNTRY = {
    "US-TX-01": "US",
    "US-TX-02": "US",
    "US-TX-03": "US",
    "US-FL-01": "US",
    "US-FL-02": "US",
    "US-FL-03": "US",
    "US-GA-01": "US",
    "US-GA-02": "US",
    "US-GA-03": "US",
    "UK-LON-01": "UK",
    "UK-LON-02": "UK",
    "UK-MAN-01": "UK",
}
COUNTRIES = ("US", "UK")
CATEGORIES = ("APPOINTMENT", "BILLING", "CLINICAL_CARE", "ACCESSIBILITY", "ADMINISTRATIVE")
STATUSES = ("OPEN", "CLOSED", "DISCARDED")
SCORES = (1, 2, 3, 4, 5)
MIN_DESCRIPTION_LENGTH = 5
PATIENT_ID_PATTERN = re.compile(r"PAT-[0-9]{6}")
SCORE_PATTERN = re.compile(r"[0-9]+")

# Briefing rules, in report order.
INVALID_RULES = (
    "missing_clinic_id",
    "country_mismatch",
    "missing_category",
    "empty_description",
    "missing_patient_id",
    "closed_without_score",
    "score_out_of_range",
)
# Not in the briefing; only reported when they occur.
EXTRA_RULES = ("unknown_status", "malformed_row")


class CSVAnalysisError(ValueError):
    """Raised when the CSV cannot be analyzed. Messages never contain cell values."""


def _percentage(count: int, total: int) -> float:
    return round(count * 100 / total, 1) if total else 0.0


@dataclass(frozen=True)
class AnalysisResult:
    total_records: int
    valid_records: int
    invalid_records: int
    invalid_by_rule: dict[str, int]
    categories: dict[str, int]
    statuses: dict[str, int]
    countries: dict[str, int]
    closed_cases: int
    scored_cases: int
    average_score: float | None
    score_distribution: dict[int, int]

    def to_dict(self) -> dict[str, Any]:
        def breakdown(values: dict[str, int]) -> dict[str, dict[str, float]]:
            return {
                key: {"count": count, "percentage": _percentage(count, self.valid_records)}
                for key, count in values.items()
            }

        return {
            "total_records": self.total_records,
            "valid_records": self.valid_records,
            "invalid_records": self.invalid_records,
            "invalid_by_rule": self.invalid_by_rule,
            "categories": breakdown(self.categories),
            "statuses": breakdown(self.statuses),
            "countries": breakdown(self.countries),
            "satisfaction": {
                "closed_cases": self.closed_cases,
                "scored_cases": self.scored_cases,
                "average_score": self.average_score,
                "score_distribution": {str(score): count for score, count in self.score_distribution.items()},
            },
        }

    def to_csv(self) -> str:
        output = io.StringIO(newline="")
        writer = csv.writer(output)
        writer.writerow(("metric", "value", "percentage"))
        writer.writerow(("total_records", self.total_records, ""))
        writer.writerow(("valid_records", self.valid_records, ""))
        writer.writerow(("invalid_records", self.invalid_records, ""))
        for rule, count in self.invalid_by_rule.items():
            writer.writerow((f"invalid_{rule}", count, ""))
        for prefix, values in (
            ("category", self.categories),
            ("status", self.statuses),
            ("country", self.countries),
        ):
            for key, count in values.items():
                writer.writerow((f"{prefix}_{key}", count, _percentage(count, self.valid_records)))
        writer.writerow(("closed_cases", self.closed_cases, ""))
        writer.writerow(("scored_cases", self.scored_cases, ""))
        writer.writerow(("avg_satisfaction", "" if self.average_score is None else f"{self.average_score:.2f}", ""))
        for score, count in self.score_distribution.items():
            writer.writerow((f"score_{score}", count, ""))
        return output.getvalue()


def _clean(value: str | None) -> str:
    return value.strip() if value is not None else ""


def _parse_score(raw: str) -> int | None:
    if not SCORE_PATTERN.fullmatch(raw):
        return None
    score = int(raw)
    return score if score in SCORES else None


def _row_violations(row: dict[Any, Any]) -> list[str]:
    violations: list[str] = []
    if None in row:
        violations.append("malformed_row")

    clinic_id = _clean(row.get("clinic_id"))
    clinic_country = CLINIC_COUNTRY.get(clinic_id)
    if clinic_country is None:
        violations.append("missing_clinic_id")
    elif _clean(row.get("country")) != clinic_country:
        violations.append("country_mismatch")

    if _clean(row.get("category")) not in CATEGORIES:
        violations.append("missing_category")

    if len(_clean(row.get("description"))) < MIN_DESCRIPTION_LENGTH:
        violations.append("empty_description")

    if not PATIENT_ID_PATTERN.fullmatch(_clean(row.get("patient_id"))):
        violations.append("missing_patient_id")

    status = _clean(row.get("status"))
    if status not in STATUSES:
        violations.append("unknown_status")

    raw_score = _clean(row.get("satisfaction_score"))
    if raw_score:
        if _parse_score(raw_score) is None:
            violations.append("score_out_of_range")
    elif status == "CLOSED":
        violations.append("closed_without_score")

    return violations


def analyze_csv(content: bytes | str) -> AnalysisResult:
    if isinstance(content, bytes):
        try:
            text = content.decode("utf-8-sig")
        except UnicodeDecodeError:
            raise CSVAnalysisError("El fichero debe estar codificado en UTF-8.") from None
    else:
        text = content.lstrip("\ufeff")

    if not text.strip():
        raise CSVAnalysisError("El fichero CSV está vacío.")

    reader = csv.DictReader(io.StringIO(text, newline=""), strict=True)
    try:
        headers = reader.fieldnames
    except csv.Error:
        raise CSVAnalysisError("No se pudo leer la fila de encabezados del CSV.") from None

    if not headers:
        raise CSVAnalysisError("El CSV debe incluir una fila de encabezados.")
    if len(headers) != len(set(headers)):
        raise CSVAnalysisError("El CSV contiene nombres de columna duplicados.")
    missing_columns = [column for column in REQUIRED_COLUMNS if column not in headers]
    if missing_columns:
        raise CSVAnalysisError("Faltan columnas obligatorias: " + ", ".join(missing_columns))

    total = 0
    invalid = 0
    rule_counts: Counter[str] = Counter()
    categories: Counter[str] = Counter()
    statuses: Counter[str] = Counter()
    countries: Counter[str] = Counter()
    score_counts: Counter[int] = Counter()

    try:
        for row in reader:
            if all(value is None or not str(value).strip() for value in row.values()):
                continue
            total += 1
            violations = _row_violations(row)
            if violations:
                invalid += 1
                rule_counts.update(violations)
                continue
            categories[_clean(row["category"])] += 1
            status = _clean(row["status"])
            statuses[status] += 1
            countries[_clean(row["country"])] += 1
            if status == "CLOSED":
                score_counts[_parse_score(_clean(row.get("satisfaction_score")))] += 1
    except csv.Error:
        # csv.Error text can quote cell content, so only the line number is reported.
        raise CSVAnalysisError(
            f"El CSV tiene una estructura incorrecta cerca de la línea {reader.line_num}."
        ) from None

    if total == 0:
        raise CSVAnalysisError("El CSV no contiene registros para analizar.")

    invalid_by_rule = {rule: rule_counts[rule] for rule in INVALID_RULES}
    invalid_by_rule.update({rule: rule_counts[rule] for rule in EXTRA_RULES})
    scored_cases = sum(score_counts.values())
    closed_cases = statuses["CLOSED"]
    average = (
        round(sum(score * count for score, count in score_counts.items()) / scored_cases, 2)
        if scored_cases
        else None
    )

    return AnalysisResult(
        total_records=total,
        valid_records=total - invalid,
        invalid_records=invalid,
        invalid_by_rule=invalid_by_rule,
        categories={category: categories[category] for category in CATEGORIES},
        statuses={status: statuses[status] for status in STATUSES},
        countries={country: countries[country] for country in COUNTRIES},
        closed_cases=closed_cases,
        scored_cases=scored_cases,
        average_score=average,
        score_distribution={score: score_counts[score] for score in SCORES},
    )
