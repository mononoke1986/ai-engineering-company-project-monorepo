import { useCallback, useEffect, useState } from "react";
import { getAllCandidates } from "@/services/api";
import type { Candidate } from "@/types/candidate";

export type CandidatesState =
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "success"; candidates: Candidate[] };

export function useCandidates() {
  const [state, setState] = useState<CandidatesState>({ kind: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;

    getAllCandidates()
      .then((candidates) => {
        if (!cancelled) setState({ kind: "success", candidates });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        const message =
          error instanceof Error ? error.message : "Ocurrió un error inesperado.";
        setState({ kind: "error", message });
      });

    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const retry = useCallback(() => {
    setState({ kind: "loading" });
    setAttempt((current) => current + 1);
  }, []);

  return { state, retry };
}