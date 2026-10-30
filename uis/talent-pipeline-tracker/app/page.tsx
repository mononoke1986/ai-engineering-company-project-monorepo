import { Suspense } from "react";
import { CandidateList } from "@/components/CandidateList";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <header className="mb-6">
          <p className="text-sm font-medium text-teal-700">HealthCore · People</p>
          <h1 className="text-2xl font-semibold">
            Selección: Asistente de Dirección
          </h1>
          <p className="text-sm text-slate-600">Sede de Austin</p>
        </header>

        <Suspense
          fallback={<p role="status" className="text-slate-600">Cargando…</p>}
        >
          <CandidateList />
        </Suspense>
      </div>
    </main>
  );
}