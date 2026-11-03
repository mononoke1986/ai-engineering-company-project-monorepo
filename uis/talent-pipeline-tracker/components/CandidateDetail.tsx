"use client";

import type { ReactNode } from "react";
import { useParams, useRouter } from "next/navigation";
import { StageBadge, StatusBadge } from "@/components/Badges";
import { NotesSection } from "@/components/NotesSection";
import { StatusStageControls } from "@/components/StatusStageControls";
import { useCandidate } from "@/hooks/useCandidate";
import { formatDate } from "@/lib/format";
import type { Candidate } from "@/types/candidate";

export function CandidateDetail() {
  const params = useParams<{ id: string }>();
  return <CandidateView key={params.id} id={params.id} />;
}

function InfoItem({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-0.5 text-sm text-slate-900">{children}</dd>
    </div>
  );
}

function ExternalLink({ href, text }: { href: string | null; text: string }) {
  if (!href) return <span className="text-slate-500">No disponible</span>;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-teal-700 hover:underline"
    >
      {text}
    </a>
  );
}

function CandidateInfo({ candidate }: { candidate: Candidate }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4">
      <h2 className="mb-3 text-lg font-semibold">Datos de la candidatura</h2>
      <dl className="grid gap-4 sm:grid-cols-2">
        <InfoItem label="Correo electrónico">
          <a href={`mailto:${candidate.email}`} className="text-teal-700 hover:underline">
            {candidate.email}
          </a>
        </InfoItem>
        <InfoItem label="Teléfono">{candidate.phone}</InfoItem>
        <InfoItem label="Puesto">{candidate.position}</InfoItem>
        <InfoItem label="Años de experiencia">{candidate.experience_years}</InfoItem>
        <InfoItem label="LinkedIn">
          <ExternalLink href={candidate.linkedin_url} text="Ver perfil" />
        </InfoItem>
        <InfoItem label="Currículum (CV)">
          <ExternalLink href={candidate.cv_url} text="Abrir CV" />
        </InfoItem>
        <InfoItem label="Fecha de aplicación">{formatDate(candidate.applied_at)}</InfoItem>
        <InfoItem label="Última actualización">{formatDate(candidate.updated_at)}</InfoItem>
      </dl>
    </section>
  );
}

function CandidateView({ id }: { id: string }) {
  const router = useRouter();
  const { state, retry, refresh, applyUpdate } = useCandidate(id);

  function goBack() {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  }

  const backButton = (
    <button
      type="button"
      onClick={goBack}
      className="mb-4 text-sm font-medium text-teal-700 hover:underline"
    >
      ← Volver al listado
    </button>
  );

  if (state.kind === "loading") {
    return (
      <div>
        {backButton}
        <p role="status" className="rounded-lg bg-white p-6 text-slate-600">
          Cargando candidatura…
        </p>
      </div>
    );
  }

  if (state.kind === "error") {
    return (
      <div>
        {backButton}
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-6">
          <p className="font-medium text-red-800">No se pudo cargar la candidatura</p>
          <p className="mt-1 text-sm text-red-700">{state.message}</p>
          <button
            type="button"
            onClick={retry}
            className="mt-3 rounded-md bg-red-700 px-3 py-2 text-sm font-medium text-white"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  const { candidate } = state;

  return (
    <div>
      {backButton}

      <header className="mb-6">
        <p className="text-sm font-medium text-teal-700">
          HealthCore · People · Asistente de Dirección, Sede de Austin
        </p>
        <h1 className="text-2xl font-semibold">{candidate.full_name}</h1>
        <p className="text-sm text-slate-600">{candidate.position}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <StatusBadge status={candidate.status} />
          <StageBadge stage={candidate.stage} />
        </div>
      </header>

      <div className="space-y-4">
        <CandidateInfo candidate={candidate} />
        <StatusStageControls candidate={candidate} onUpdated={applyUpdate} />
        <NotesSection
          candidateId={candidate.id}
          notes={candidate.notes}
          onChanged={refresh}
        />
      </div>
    </div>
  );
}