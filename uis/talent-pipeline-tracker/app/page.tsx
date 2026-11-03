import Link from "next/link";
import { Suspense } from "react";
import { CandidateList } from "@/components/CandidateList";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-6xl px-4 py-8">
        
        {/* Este es el encabezado con el botón a la derecha */}
        <header className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-teal-700">HealthCore · People</p>
            <h1 className="text-2xl font-semibold">
              Selección: Asistente de Dirección
            </h1>
            <p className="text-sm text-slate-600">Sede de Austin</p>
          </div>
          
          <Link
            href="/candidates/new"
            className="rounded-md bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800"
          >
            + Nueva candidatura
          </Link>
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