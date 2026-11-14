import { STAGE_LABELS, STATUS_LABELS } from "@/lib/labels";
import type { CandidateStage, CandidateStatus } from "@/types/candidate";

const STATUS_STYLES: Record<CandidateStatus, string> = {
  received: "bg-slate-100 text-slate-700",
  in_progress: "bg-blue-100 text-blue-800",
  selected: "bg-green-100 text-green-800",
  discarded: "bg-red-100 text-red-800",
};

const BADGE_BASE =
  "inline-block rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap";

export function StatusBadge({ status }: { status: CandidateStatus }) {
  return (
    <span className={`${BADGE_BASE} ${STATUS_STYLES[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}

export function StageBadge({ stage }: { stage: CandidateStage }) {
  return (
    <span className={`${BADGE_BASE} bg-violet-100 text-violet-800`}>
      {STAGE_LABELS[stage]}
    </span>
  );
}