"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { saveToken } from "@/lib/auth";

type LoginResponse = {
  access_token?: string;
};

/** Muestra un formulario de email y contraseña para entrar en HealthCore. */
export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  /** Envía las credenciales como formulario, guarda el token y abre la página principal. */
  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      // El login usa una petición directa: todavía no existe un token que enviar.
      const response = await fetch("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ username: email, password }),
      });
      const payload: unknown = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error("No se pudo iniciar sesión. Comprueba el email y la contraseña.");
      }
      if (
        typeof payload !== "object" ||
        payload === null ||
        !("access_token" in payload) ||
        typeof (payload as LoginResponse).access_token !== "string"
      ) {
        throw new Error("La API no devolvió un token de acceso válido.");
      }

      saveToken((payload as LoginResponse).access_token as string);
      router.replace("/");
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "No se pudo iniciar sesión.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4 py-10 text-slate-900">
      <section aria-labelledby="login-title" className="mb-6">
        <p className="text-sm font-medium text-teal-700">HEALTHCORE · ACCESO</p>
        <h1 id="login-title" className="mt-2 text-2xl font-semibold">Iniciar sesión</h1>
        <p className="mt-2 text-sm text-slate-600">Introduce tu email y contraseña para continuar.</p>
      </section>

      <form onSubmit={handleLogin} className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <label htmlFor="login-email" className="text-sm font-medium">Email</label>
        <input
          id="login-email"
          type="email"
          autoComplete="username"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2"
        />

        <label htmlFor="login-password" className="mt-2 text-sm font-medium">Contraseña</label>
        <input
          id="login-password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2"
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-3 rounded-md bg-teal-700 px-4 py-2 font-medium text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Entrando…" : "Entrar"}
        </button>
        {error && <p className="text-sm text-red-700" role="alert">{error}</p>}
      </form>
      <p className="mt-4 text-center text-sm text-slate-600">
        ¿Aún no tienes cuenta? <Link href="/register" className="font-medium text-teal-700 underline">Crear cuenta</Link>
      </p>
    </main>
  );
}
