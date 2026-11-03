"use client";

import { useState } from "react";
import type { FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { getErrorMessage } from "@/lib/format";
import { createCandidate, replaceCandidate } from "@/services/api";
import type { Candidate, CandidateInput } from "@/types/candidate";

interface CandidateFormProps {
  initialData?: Candidate; // Si viene esta prop, el formulario es para editar
}

const FIELD = "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900";

export function CandidateForm({ initialData }: CandidateFormProps) {
  const router = useRouter();
  const isEditing = Boolean(initialData);

  const [form, setForm] = useState<CandidateInput>({
    full_name: initialData?.full_name ?? "",
    email: initialData?.email ?? "",
    phone: initialData?.phone ?? "",
    position: initialData?.position ?? "",
    experience_years: initialData?.experience_years ?? 0,
    linkedin_url: initialData?.linkedin_url ?? "",
    cv_url: initialData?.cv_url ?? "",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "experience_years" ? Number(value) : value,
    }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      // Validación de campos obligatorios en el cliente
      if (!form.full_name || !form.email || !form.phone || !form.position) {
        throw new Error("Los campos marcados con * son obligatorios.");
      }

      if (isEditing && initialData) {
        await replaceCandidate(initialData.id, form);
        router.push(`/candidates/${initialData.id}`);
        router.refresh();
      } else {
        const newCandidate = await createCandidate(form);
        router.push(`/candidates/${newCandidate.id}`);
      }
    } catch (err) {
      setError(getErrorMessage(err));
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-slate-200 bg-white p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Nombre completo *</label>
          <input name="full_name" value={form.full_name} onChange={handleChange} className={FIELD} required />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Correo electrónico *</label>
          <input type="email" name="email" value={form.email} onChange={handleChange} className={FIELD} required />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Teléfono *</label>
          <input name="phone" value={form.phone} onChange={handleChange} className={FIELD} required />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Puesto *</label>
          <input name="position" value={form.position} onChange={handleChange} className={FIELD} required />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Años de experiencia *</label>
          <input type="number" name="experience_years" value={form.experience_years} onChange={handleChange} className={FIELD} required min="0" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">LinkedIn (Opcional)</label>
          <input name="linkedin_url" value={form.linkedin_url ?? ""} onChange={handleChange} className={FIELD} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Currículum / CV (Opcional)</label>
          <input name="cv_url" value={form.cv_url ?? ""} onChange={handleChange} className={FIELD} />
        </div>
      </div>

      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}

      <div className="flex gap-2 pt-2">
        <button type="submit" disabled={saving} className="rounded-md bg-teal-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-60">
          {saving ? "Guardando..." : isEditing ? "Guardar cambios" : "Registrar candidatura"}
        </button>
        <button type="button" onClick={() => router.back()} className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
          Cancelar
        </button>
      </div>
    </form>
  );
}