import { useCallback, useEffect, useState } from "react";
import { getErrorMessage } from "@/lib/format";
import { getCandidateById } from "@/services/api";
import type { Candidate } from "@/types/candidate";

export type CandidateState =
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "success"; candidate: Candidate };

export function useCandidate(id: string) {
  const [state, setState] = useState<CandidateState>({ kind: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;

    getCandidateById(id)
      .then((candidate) => {
        if (!cancelled) setState({ kind: "success", candidate });
      })
      .catch((error: unknown) => {
        if (!cancelled) setState({ kind: "error", message: getErrorMessage(error) });
      });

    return () => {
      cancelled = true;
    };
  }, [id, attempt]);

  const retry = useCallback(() => {
    setState({ kind: "loading" });
    setAttempt((current) => current + 1);
  }, []);

  // Vuelve a pedir la candidatura (por ejemplo, tras añadir o borrar una nota).
  const refresh = useCallback(async () => {
    const candidate = await getCandidateById(id);
    setState({ kind: "success", candidate });
  }, [id]);

  // Copia a la pantalla el nuevo estado y etapa que confirmó la API.
  const applyUpdate = useCallback((updated: Candidate) => {
    setState((current) =>
      current.kind === "success"
        ? {
            kind: "success",
            candidate: {
              ...current.candidate,
              status: updated.status,
              stage: updated.stage,
              updated_at: updated.updated_at,
            },
          }
        : current
    );
  }, []);

  return { state, retry, refresh, applyUpdate };
}