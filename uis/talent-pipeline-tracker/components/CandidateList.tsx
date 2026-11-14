"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { StageBadge, StatusBadge } from "@/components/Badges";
import { FilterBar } from "@/components/FilterBar";
import { useCandidates } from "@/hooks/useCandidates";
import { filterCandidates, parseStage, parseStatus } from "@/lib/filters";

export function CandidateList() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { state, retry } = useCandidates();
  const [query, setQuery] = useState("");

  const status = parseStatus(searchParams.get("status"));
  const stage = parseStage(searchParams.get("stage"));

  function updateParam(key: "status" | "stage", value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    const queryString = params.toString();
    router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
      scroll: false,
    });
  }

  function clearFilters() {
    setQuery("");
    router.replace(pathname, { scroll: false });
  }

  if (state.kind === "loading") {
    return (
      <p role="status" className="rounded-lg bg-white p-6 text-slate-600">
        Cargando candidaturas…
      </p>
    );
  }

  if (state.kind === "error") {
    return (
      <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-6">
        <p className="font-medium text-red-800">
          No se pudieron cargar las candidaturas
        </p>
        <p className="mt-1 text-sm text-red-700">{state.message}</p>
        <button
          type="button"
          onClick={retry}
          className="mt-3 rounded-md bg-red-700 px-3 py-2 text-sm font-medium text-white"
        >
          Reintentar
        </button>
      </div>
    );
  }

  const filters = { status, stage, query };
  const visible = filterCandidates(state.candidates, filters);

  return (
    <section>
      <FilterBar
        filters={filters}
        onStatusChange={(value) => updateParam("status", value)}
        onStageChange={(value) => updateParam("stage", value)}
        onQueryChange={setQuery}
        onClear={clearFilters}
      />

      <p className="mb-2 text-sm text-slate-600" aria-live="polite">
        Mostrando {visible.length} de {state.candidates.length} candidaturas
      </p>

      {visible.length === 0 ? (
        <p className="rounded-lg border border-slate-200 bg-white p-6 text-slate-600">
          Ninguna candidatura coincide con los filtros actuales.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">Nombre</th>
                <th scope="col" className="px-4 py-3 font-medium">Puesto</th>
                <th scope="col" className="px-4 py-3 font-medium">Estado</th>
                <th scope="col" className="px-4 py-3 font-medium">Etapa</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((candidate) => (
                <tr key={candidate.id} className="border-t border-slate-100">
                  <td className="px-4 py-3">
                    <Link
                      href={`/candidates/${candidate.id}`}
                      className="font-medium text-teal-700 hover:underline"
                    >
                      {candidate.full_name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{candidate.position}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={candidate.status} />
                  </td>
                  <td className="px-4 py-3">
                    <StageBadge stage={candidate.stage} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}