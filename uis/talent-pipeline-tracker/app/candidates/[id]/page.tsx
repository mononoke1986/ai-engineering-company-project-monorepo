import { Suspense } from "react";
import { CandidateDetail } from "@/components/CandidateDetail";

export default function CandidatePage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <Suspense
          fallback={<p role="status" className="text-slate-600">Cargando…</p>}
        >
          <CandidateDetail />
        </Suspense>
      </div>
    </main>
  );
}