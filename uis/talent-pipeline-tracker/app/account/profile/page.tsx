"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { healthcoreRequest } from "@/services/healthcore-api";

type Profile = { name?: string | null; phone?: string | null; address?: string | null };
type MeResponse = { email?: string; profile?: Profile | null };

async function readError(response: Response): Promise<string> {
  const payload: unknown = await response.json().catch(() => ({}));
  if (typeof payload === "object" && payload !== null && "detail" in payload) {
    const detail = (payload as { detail?: unknown }).detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail) && typeof detail[0] === "object" && detail[0] !== null && "msg" in detail[0]) {
      return String((detail[0] as { msg: unknown }).msg);
    }
  }
  return "No se pudo completar la solicitud.";
}

/** Lee y actualiza los datos de contacto del usuario conectado. */
export default function ProfilePage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let isCurrent = true;
    async function loadProfile() {
      try {
        const response = await healthcoreRequest("/auth/me");
        if (!response.ok) throw new Error(await readError(response));
        const data = await response.json() as MeResponse;
        if (!isCurrent) return;
        setEmail(data.email ?? "");
        setName(data.profile?.name ?? "");
        setPhone(data.profile?.phone ?? "");
        setAddress(data.profile?.address ?? "");
      } catch (loadError) {
        if (isCurrent) setError(loadError instanceof Error ? loadError.message : "No se pudieron cargar tus datos.");
      } finally {
        if (isCurrent) setIsLoading(false);
      }
    }
    void loadProfile();
    return () => { isCurrent = false; };
  }, []);

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setIsSaving(true);
    try {
      const response = await healthcoreRequest("/profiles/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        // Solo mandamos los campos editables; el email no se modifica.
        body: JSON.stringify({ name, phone, address }),
      });
      if (!response.ok) throw new Error(await readError(response));
      setSuccess("Tus datos se guardaron correctamente.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "No se pudieron guardar tus datos.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-xl px-4 py-10 text-slate-900">
      <p className="text-sm font-medium text-teal-700">HEALTHCORE · CUENTA</p>
      <h1 className="mt-2 text-2xl font-semibold">Mi perfil</h1>
      <p className="mt-2 text-sm text-slate-600">Consulta y actualiza tus datos de contacto.</p>

      {isLoading ? <p className="mt-6" role="status">Cargando perfil…</p> : (
        <form onSubmit={saveProfile} className="mt-6 flex flex-col gap-2 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <label htmlFor="profile-email" className="text-sm font-medium">Email</label>
          <input id="profile-email" type="email" value={email} readOnly className="rounded-md border border-slate-300 bg-slate-100 px-3 py-2 text-slate-600" />

          <label htmlFor="profile-name" className="mt-2 text-sm font-medium">Nombre</label>
          <input id="profile-name" autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} className="rounded-md border border-slate-300 px-3 py-2" />

          <label htmlFor="profile-phone" className="mt-2 text-sm font-medium">Teléfono</label>
          <input id="profile-phone" type="tel" autoComplete="tel" value={phone} onChange={(event) => setPhone(event.target.value)} className="rounded-md border border-slate-300 px-3 py-2" />

          <label htmlFor="profile-address" className="mt-2 text-sm font-medium">Dirección</label>
          <input id="profile-address" autoComplete="street-address" value={address} onChange={(event) => setAddress(event.target.value)} className="rounded-md border border-slate-300 px-3 py-2" />

          <button type="submit" disabled={isSaving} className="mt-3 rounded-md bg-teal-700 px-4 py-2 font-medium text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60">
            {isSaving ? "Guardando…" : "Guardar cambios"}
          </button>
          {success && <p className="text-sm text-green-700" role="status">{success}</p>}
          {error && <p className="text-sm text-red-700" role="alert">{error}</p>}
        </form>
      )}
      <Link href="/" className="mt-4 inline-block text-sm font-medium text-teal-700 underline">Volver a la página principal</Link>
    </main>
  );
}