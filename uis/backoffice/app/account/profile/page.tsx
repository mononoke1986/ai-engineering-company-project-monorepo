"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";

type ProfileData = {
  email: string;
  name: string;
  phone: string;
  address: string;
};

type MeResponse = {
  email?: string;
  profile?: {
    name?: string | null;
    phone?: string | null;
    address?: string | null;
  } | null;
};

/** Permite ver y actualizar los datos personales de la cuenta conectada. */
export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData>({
    email: "",
    name: "",
    phone: "",
    address: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Pide a la API los datos de la persona que inició sesión.
  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await apiRequest("/auth/me");
        const data = (await response.json()) as MeResponse;
        setProfile({
          email: data.email ?? "",
          name: data.profile?.name ?? "",
          phone: data.profile?.phone ?? "",
          address: data.profile?.address ?? "",
        });
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "No se pudo cargar el perfil.");
      } finally {
        setIsLoading(false);
      }
    }

    void loadProfile();
  }, []);

  /** Guarda en la API los campos editables del perfil. */
  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setIsSaving(true);

    try {
      const response = await apiRequest("/profiles/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profile.name,
          phone: profile.phone,
          address: profile.address,
        }),
      });
      if (!response.ok) {
        const payload: unknown = await response.json().catch(() => ({}));
        const detail =
          typeof payload === "object" && payload !== null && "detail" in payload &&
          typeof payload.detail === "string"
            ? payload.detail
            : "No se pudieron guardar los cambios.";
        throw new Error(detail);
      }
      setMessage("Perfil guardado correctamente.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "No se pudieron guardar los cambios.");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return <main className="workspace"><p role="status">Cargando perfil…</p></main>;
  }

  return (
    <main className="workspace">
      <section className="page-heading" aria-labelledby="profile-title">
        <p className="eyebrow">CUENTA <span>/</span> HEALTHCORE</p>
        <h1 id="profile-title">Mi perfil</h1>
        <p className="page-description"><Link href="/">Volver al inicio</Link></p>
      </section>
      <form className="upload-panel" onSubmit={handleSave}>
        <label htmlFor="profile-email">Email</label>
        <input id="profile-email" type="email" value={profile.email} readOnly />

        <label htmlFor="profile-name">Nombre</label>
        <input id="profile-name" type="text" autoComplete="name" value={profile.name}
          onChange={(event) => setProfile((current) => ({ ...current, name: event.target.value }))} />

        <label htmlFor="profile-phone">Teléfono</label>
        <input id="profile-phone" type="tel" autoComplete="tel" value={profile.phone}
          onChange={(event) => setProfile((current) => ({ ...current, phone: event.target.value }))} />

        <label htmlFor="profile-address">Dirección</label>
        <input id="profile-address" type="text" autoComplete="street-address" value={profile.address}
          onChange={(event) => setProfile((current) => ({ ...current, address: event.target.value }))} />

        <button className="primary-button" type="submit" disabled={isSaving}>
          {isSaving ? "Guardando…" : "Guardar cambios"}
        </button>
        {message && <p role="status">{message}</p>}
        {error && <p className="error-message" role="alert">{error}</p>}
      </form>
    </main>
  );
}
