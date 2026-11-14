import { CandidateForm } from "@/components/CandidateForm";
import Link from "next/link";

export default function NewCandidatePage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-3xl px-4 py-8">
        <Link href="/" className="mb-4 inline-block text-sm font-medium text-teal-700 hover:underline">
          ← Volver al listado
        </Link>
        <h1 className="mb-6 text-2xl font-semibold">Registrar nueva candidatura</h1>
        <CandidateForm />
      </div>
    </main>
  );
}