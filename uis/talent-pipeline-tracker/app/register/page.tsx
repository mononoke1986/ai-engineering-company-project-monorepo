"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { saveToken } from "@/lib/auth";

type RegisterField = "email" | "password" | "name" | "phone" | "address";
type FieldErrors = Partial<Record<RegisterField, string>>;
type LoginResponse = { access_token?: unknown };
type ApiIssue = { loc?: unknown[]; msg?: string };

function errorMessage(payload: unknown, fallback: string): string {
  if (typeof payload === "object" && payload !== null && "detail" in payload) {
    const detail = (payload as { detail?: unknown }).detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail)) {
      const firstMessage = detail.find(
        (issue): issue is ApiIssue => typeof issue === "object" && issue !== null && "msg" in issue
      )?.msg;
      if (firstMessage) return firstMessage;
    }
  }
  return fallback;
}

/** Crea la cuenta y, si funciona, inicia sesión automáticamente. */
export default function RegisterPage() {
  const router = useRouter();
  const [values, setValues] = useState({ email: "", password: "", name: "", phone: "", address: "" });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField(field: RegisterField, value: string) {
    setValues((previous) => ({ ...previous, [field]: value }));
    setErrors((previous) => ({ ...previous, [field]: undefined }));
    setFormError("");
  }

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrors({});
    setFormError("");
    setIsSubmitting(true);

    try {
      const registerResponse = await fetch("/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: values.email,
          password: values.password,
          name: values.name || null,
          phone: values.phone || null,
          address: values.address || null,
        }),
      });
      const registerPayload: unknown = await registerResponse.json().catch(() => ({}));

      if (!registerResponse.ok) {
        const detail = typeof registerPayload === "object" && registerPayload !== null && "detail" in registerPayload
          ? (registerPayload as { detail?: unknown }).detail
          : undefined;
        if (Array.isArray(detail)) {
          const nextErrors: FieldErrors = {};
          for (const issue of detail as ApiIssue[]) {
            const field = issue.loc?.at(-1);
            if (typeof field === "string" && ["email", "password", "name", "phone", "address"].includes(field) && issue.msg) {
              nextErrors[field as RegisterField] = issue.msg;
            }
          }
          if (Object.keys(nextErrors).length > 0) {
            setErrors(nextErrors);
          } else {
            setFormError(errorMessage(registerPayload, "No se pudo crear la cuenta."));
          }
        } else {
          setFormError(errorMessage(registerPayload, "No se pudo crear la cuenta."));
        }
        return;
      }

      const loginResponse = await fetch("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ username: values.email, password: values.password }),
      });
      const loginPayload: unknown = await loginResponse.json().catch(() => ({}));
      if (!loginResponse.ok) {
        throw new Error(errorMessage(loginPayload, "La cuenta se creó, pero no se pudo iniciar sesión."));
      }
      if (
        typeof loginPayload !== "object" || loginPayload === null ||
        typeof (loginPayload as LoginResponse).access_token !== "string"
      ) {
        throw new Error("La cuenta se creó, pero el servidor no devolvió un token válido.");
      }

      saveToken((loginPayload as LoginResponse).access_token as string);
      router.replace("/");
    } catch (registerError) {
      setFormError(registerError instanceof Error ? registerError.message : "No se pudo crear la cuenta.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function fieldError(field: RegisterField) {
    return errors[field] ? <p className="text-sm text-red-700" role="alert">{errors[field]}</p> : null;
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4 py-10 text-slate-900">
      <section className="mb-6">
        <p className="text-sm font-medium text-teal-700">HEALTHCORE · REGISTRO</p>
        <h1 className="mt-2 text-2xl font-semibold">Crear cuenta</h1>
        <p className="mt-2 text-sm text-slate-600">Completa tus datos para registrarte.</p>
      </section>

      <form onSubmit={handleRegister} className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <label htmlFor="register-email" className="text-sm font-medium">Email</label>
        <input id="register-email" type="email" autoComplete="email" required value={values.email} onChange={(event) => updateField("email", event.target.value)} className="rounded-md border border-slate-300 px-3 py-2" />
        {fieldError("email")}

        <label htmlFor="register-password" className="mt-2 text-sm font-medium">Contraseña</label>
        <input id="register-password" type="password" autoComplete="new-password" required value={values.password} onChange={(event) => updateField("password", event.target.value)} className="rounded-md border border-slate-300 px-3 py-2" />
        {fieldError("password")}

        <label htmlFor="register-name" className="mt-2 text-sm font-medium">Nombre (opcional)</label>
        <input id="register-name" autoComplete="name" value={values.name} onChange={(event) => updateField("name", event.target.value)} className="rounded-md border border-slate-300 px-3 py-2" />
        {fieldError("name")}

        <label htmlFor="register-phone" className="mt-2 text-sm font-medium">Teléfono (opcional)</label>
        <input id="register-phone" type="tel" autoComplete="tel" value={values.phone} onChange={(event) => updateField("phone", event.target.value)} className="rounded-md border border-slate-300 px-3 py-2" />
        {fieldError("phone")}

        <label htmlFor="register-address" className="mt-2 text-sm font-medium">Dirección (opcional)</label>
        <input id="register-address" autoComplete="street-address" value={values.address} onChange={(event) => updateField("address", event.target.value)} className="rounded-md border border-slate-300 px-3 py-2" />
        {fieldError("address")}

        <button type="submit" disabled={isSubmitting} className="mt-3 rounded-md bg-teal-700 px-4 py-2 font-medium text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60">
          {isSubmitting ? "Creando cuenta…" : "Crear cuenta"}
        </button>
        {formError && <p className="text-sm text-red-700" role="alert">{formError}</p>}
      </form>
      <p className="mt-4 text-center text-sm text-slate-600">
        ¿Ya tienes cuenta? <Link href="/login" className="font-medium text-teal-700 underline">Iniciar sesión</Link>
      </p>
    </main>
  );
}