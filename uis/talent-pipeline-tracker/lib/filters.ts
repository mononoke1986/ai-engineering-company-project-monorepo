import type {
  Candidate,
  CandidateStage,
  CandidateStatus,
} from "@/types/candidate";
import { STAGE_VALUES, STATUS_VALUES } from "@/lib/labels";

export interface CandidateFilters {
  status: CandidateStatus | "";
  stage: CandidateStage | "";
  query: string;
}

export function parseStatus(value: string | null): CandidateStatus | "" {
  return STATUS_VALUES.find((status) => status === value) ?? "";
}

export function parseStage(value: string | null): CandidateStage | "" {
  return STAGE_VALUES.find((stage) => stage === value) ?? "";
}

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

export function filterCandidates(
  candidates: Candidate[],
  filters: CandidateFilters
): Candidate[] {
  const query = normalize(filters.query);

  return candidates.filter((candidate) => {
    if (filters.status && candidate.status !== filters.status) return false;
    if (filters.stage && candidate.stage !== filters.stage) return false;
    if (query === "") return true;
    return (
      normalize(candidate.full_name).includes(query) ||
      normalize(candidate.email).includes(query)
    );
  });
}