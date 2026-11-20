import argparse
import sys
from pathlib import Path


API_SOURCE = Path(__file__).resolve().parents[1] / "services" / "api" / "src"
sys.path.insert(0, str(API_SOURCE))

from api.incidents.analysis import EXTRA_RULES, INVALID_RULES, AnalysisResult, CSVAnalysisError, analyze_csv


RULE_LABELS = {
    "missing_clinic_id": "Invalid or missing clinic_id",
    "country_mismatch": "Country/clinic mismatch",
    "missing_category": "Invalid or missing category",
    "empty_description": "Empty description",
    "missing_patient_id": "Missing patient_id",
    "closed_without_score": "Closed case, no score",
    "score_out_of_range": "Score out of range",
    "unknown_status": "Invalid or missing status",
    "malformed_row": "Malformed row",
}
SCORE_LABELS = {
    1: "Very dissatisfied",
    2: "Dissatisfied",
    3: "Neutral",
    4: "Satisfied",
    5: "Very satisfied",
}
WIDTH = 60
LABEL_COLUMN = 40


def line(prefix: str, label: str, value: object, suffix: str = "") -> str:
    left = f"{prefix}{label} "
    return f"{left}{'.' * max(2, LABEL_COLUMN - len(left))} {value:>3}{suffix}"


def print_tree(items: list[tuple[str, object, str]], indent: str = "  ") -> None:
    for index, (label, value, suffix) in enumerate(items):
        branch = "└─ " if index == len(items) - 1 else "├─ "
        print(line(indent + branch, label, value, suffix))


def print_breakdown(title: str, values: dict[str, int], valid: int) -> None:
    print(f"\n{title}")
    print_tree([
        (key, count, f"  ({count * 100 / valid if valid else 0:.1f}%)")
        for key, count in values.items()
    ])


def print_report(result: AnalysisResult, source_name: str) -> None:
    print("=" * WIDTH)
    print("  HEALTHCORE — PATIENT INCIDENT REPORT ANALYSIS")
    print(f"  Source file: {source_name}")
    print("=" * WIDTH)

    print()
    print(line("", "TOTAL RECORDS IN FILE", result.total_records))
    print_tree([
        ("Valid records", result.valid_records, ""),
        ("Invalid / incomplete", result.invalid_records, ""),
    ])

    rules = list(INVALID_RULES) + [rule for rule in EXTRA_RULES if result.invalid_by_rule[rule]]
    print("\nINVALID RECORDS BREAKDOWN")
    print_tree([(RULE_LABELS[rule], result.invalid_by_rule[rule], "") for rule in rules])

    print_breakdown("BREAKDOWN BY CATEGORY (valid records)", result.categories, result.valid_records)
    print_breakdown("BREAKDOWN BY STATUS (valid records)", result.statuses, result.valid_records)
    print_breakdown("BREAKDOWN BY COUNTRY (valid records)", result.countries, result.valid_records)

    print("\nSATISFACTION INDEX (closed cases)")
    print(f"  Scored cases: {result.scored_cases} of {result.closed_cases}")
    average = "n/a" if result.average_score is None else f"{result.average_score:.2f} / 5.00"
    print(f"  Average score: {average}")
    print_tree([
        (f"Score {score} ({SCORE_LABELS[score]})", count, "")
        for score, count in result.score_distribution.items()
    ])

    print()
    print("=" * WIDTH)


def main() -> int:
    parser = argparse.ArgumentParser(description="Validate and summarise a HealthCore incident CSV.")
    parser.add_argument("csv_path", type=Path, help="Path to the incident CSV file")
    args = parser.parse_args()

    try:
        result = analyze_csv(args.csv_path.read_bytes())
    except OSError as error:
        print(f"Could not read file: {error.strerror}", file=sys.stderr)
        return 1
    except CSVAnalysisError as error:
        print(f"Invalid CSV: {error}", file=sys.stderr)
        return 1

    print_report(result, args.csv_path.name)
    try:
        answer = input("Export results to CSV? [y / n]: ").strip().lower()
    except EOFError:
        answer = "n"
        print()
    if answer == "y":
        Path("results.csv").write_text(result.to_csv(), encoding="utf-8", newline="")
        print("Results saved to results.csv.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())