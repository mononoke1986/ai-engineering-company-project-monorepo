"use client";

import { useState } from "react";
import { parseStage, parseStatus } from "@/lib/filters";
import { getErrorMessage } from "@/lib/format";
import {
  STAGE_LABELS,
  STAGE_VALUES,
  STATUS_LABELS,
  STATUS_VALUES,
} from "@/lib/labels";
import { updateCandidateStage, updateCandidateStatus } from "@/services/api";
import type { Candidate } from "@/types/candidate";

interface StatusStageControlsProps {
  candidate: Candidate;
  onUpdated: (updated: Candidate) => void;
}

type SaveState =
  | { kind: "idle" }
  | { kind: "saving" }
  | { kind: "saved" }
  | { kind: "error"; message: string };

const FIELD =
  "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900";

export function StatusStageControls({
  candidate,
  onUpdated,
}: StatusStageControlsProps) {
  const [save, setSave] = useState<SaveState>({ kind: "idle" });

  async function apply(action: () => Promise<Candidate>) {
    setSave({ kind: "saving" });
    try {
      onUpdated(await action());
      setSave({ kind: "saved" });
    } catch (error) {
      setSave({ kind: "error", message: getErrorMessage(error) });
    }
  }

  function handleStatusChange(value: string) {
    const status = parseStatus(value);
    if (status) void apply(() => updateCandidateStatus(candidate.id, status));
  }

  function handleStageChange(value: string) {
    const stage = parseStage(value);
    if (stage) void apply(() => updateCandidateStage(candidate.id, stage));
  }

  const saving = save.kind === "saving";

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4">
      <h2 className="mb-3 text-lg font-semibold">Estado y etapa</h2>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="detail-status" className="mb-1 block text-sm font-medium text-slate-700">
            Estado
          </label>
          <select
            id="detail-status"
            value={candidate.status}
            disabled={saving}
            onChange={(event) => handleStatusChange(event.target.value)}
            className={FIELD}
          >
            {STATUS_VALUES.map((status) => (
              <option key={status} value={status}>
                {STATUS_LABELS[status]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="detail-stage" className="mb-1 block text-sm font-medium text-slate-700">
            Etapa
          </label>
          <select
            id="detail-stage"
            value={candidate.stage}
            disabled={saving}
            onChange={(event) => handleStageChange(event.target.value)}
            className={FIELD}
          >
            {STAGE_VALUES.map((stage) => (
              <option key={stage} value={stage}>
                {STAGE_LABELS[stage]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {save.kind === "saving" && (
        <p role="status" className="mt-3 text-sm text-slate-600">
          Guardando cambios…
        </p>
      )}
      {save.kind === "saved" && (
        <p role="status" className="mt-3 text-sm text-green-700">
          Cambios guardados correctamente.
        </p>
      )}
      {save.kind === "error" && (
        <p role="alert" className="mt-3 text-sm text-red-700">
          No se pudo guardar el cambio: {save.message}
        </p>
      )}
    </section>
  );
}