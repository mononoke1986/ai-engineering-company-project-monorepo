"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { saveToken } from "@/lib/auth";

/** Muestra el formulario que inicia sesión con el email y la contraseña. */
export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  /** Envía las credenciales como formulario y guarda el token que devuelve la API. */
  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ username: email, password }),
      });
      const payload: unknown = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error("Email o contraseña incorrectos.");
      }
      if (
        typeof payload !== "object" ||
        payload === null ||
        !("access_token" in payload) ||
        typeof payload.access_token !== "string"
      ) {
        throw new Error("La API no devolvió un token válido.");
      }

      saveToken(payload.access_token);
      router.replace("/");
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "No se pudo iniciar sesión.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="workspace">
      <section className="page-heading" aria-labelledby="login-title">
        <p className="eyebrow">ACCESO RESTRINGIDO <span>/</span> HEALTHCORE</p>
        <h1 id="login-title">Iniciar sesión</h1>
        <p className="page-description">Usa tu cuenta HealthCore para continuar.</p>
      </section>
      <form className="upload-panel" onSubmit={handleLogin}>
        <label htmlFor="login-email">Email</label>
        <input
          id="login-email"
          type="email"
          autoComplete="username"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <label htmlFor="login-password">Contraseña</label>
        <input
          id="login-password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <button className="primary-button" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Entrando…" : "Entrar"}
        </button>
        {error && <p className="error-message" role="alert">{error}</p>}
      </form>
    </main>
  );
}
