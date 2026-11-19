"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { saveToken } from "@/lib/auth";

type RegisterFields = "email" | "password" | "name" | "phone" | "address";
type FieldErrors = Partial<Record<RegisterFields, string>>;
type RegisterValues = Record<RegisterFields, string>;

/** Muestra el formulario para crear una cuenta HealthCore. */
export default function RegisterPage() {
  const router = useRouter();
  const [values, setValues] = useState<RegisterValues>({
    email: "",
    password: "",
    name: "",
    phone: "",
    address: "",
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  /** Guarda el texto que se escribe y limpia el error de ese campo. */
  function updateField(field: RegisterFields, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  /** Convierte los errores que devuelve la API en mensajes bajo cada campo. */
  async function showApiErrors(response: Response): Promise<boolean> {
    const payload: unknown = await response.json().catch(() => ({}));
    if (typeof payload !== "object" || payload === null || !("detail" in payload)) {
      return false;
    }

    const detail = payload.detail;
    if (Array.isArray(detail)) {
      const fieldErrors: FieldErrors = {};
      for (const item of detail) {
        if (typeof item !== "object" || item === null || !("loc" in item) || !("msg" in item)) {
          continue;
        }
        const location = item.loc;
        const message = item.msg;
        if (!Array.isArray(location) || typeof message !== "string") continue;
        const field = location.at(-1);
        if (
          typeof field === "string" &&
          ["email", "password", "name", "phone", "address"].includes(field)
        ) {
          fieldErrors[field as RegisterFields] = message;
        }
      }
      if (Object.keys(fieldErrors).length > 0) {
        setErrors(fieldErrors);
        return true;
      }
    }

    if (typeof detail === "string") {
      setFormError(detail);
      return true;
    }
    return false;
  }

  /** Crea la cuenta, inicia sesión con ella y guarda el token recibido. */
  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrors({});
    setFormError("");
    setIsSubmitting(true);

    const registration: Record<string, string> = {
      email: values.email,
      password: values.password,
    };
    if (values.name.trim()) registration.name = values.name.trim();
    if (values.phone.trim()) registration.phone = values.phone.trim();
    if (values.address.trim()) registration.address = values.address.trim();

    try {
      const registerResponse = await fetch("/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registration),
      });
      if (!registerResponse.ok) {
        if (!(await showApiErrors(registerResponse))) {
          setFormError("No se pudo crear la cuenta. Inténtalo de nuevo.");
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
        setFormError("La cuenta se creó, pero no se pudo iniciar sesión. Entra desde /login.");
        return;
      }
      if (
        typeof loginPayload !== "object" ||
        loginPayload === null ||
        !("access_token" in loginPayload) ||
        typeof loginPayload.access_token !== "string"
      ) {
        setFormError("La cuenta se creó, pero la API no devolvió un token válido.");
        return;
      }

      saveToken(loginPayload.access_token);
      router.replace("/");
    } catch {
      setFormError("No se pudo conectar con el servidor. Inténtalo de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="workspace">
      <section className="page-heading" aria-labelledby="register-title">
        <p className="eyebrow">ACCESO RESTRINGIDO <span>/</span> HEALTHCORE</p>
        <h1 id="register-title">Crear cuenta</h1>
        <p className="page-description">Completa los datos para registrarte.</p>
      </section>
      <form className="upload-panel" onSubmit={handleRegister} noValidate>
        <label htmlFor="register-email">Email</label>
        <input id="register-email" type="email" autoComplete="email" required value={values.email}
          onChange={(event) => updateField("email", event.target.value)} aria-invalid={Boolean(errors.email)} />
        {errors.email && <p className="error-message" role="alert">{errors.email}</p>}

        <label htmlFor="register-password">Contraseña</label>
        <input id="register-password" type="password" autoComplete="new-password" required value={values.password}
          onChange={(event) => updateField("password", event.target.value)} aria-invalid={Boolean(errors.password)} />
        {errors.password && <p className="error-message" role="alert">{errors.password}</p>}

        <label htmlFor="register-name">Nombre (opcional)</label>
        <input id="register-name" type="text" autoComplete="name" value={values.name}
          onChange={(event) => updateField("name", event.target.value)} aria-invalid={Boolean(errors.name)} />
        {errors.name && <p className="error-message" role="alert">{errors.name}</p>}

        <label htmlFor="register-phone">Teléfono (opcional)</label>
        <input id="register-phone" type="tel" autoComplete="tel" value={values.phone}
          onChange={(event) => updateField("phone", event.target.value)} aria-invalid={Boolean(errors.phone)} />
        {errors.phone && <p className="error-message" role="alert">{errors.phone}</p>}

        <label htmlFor="register-address">Dirección (opcional)</label>
        <input id="register-address" type="text" autoComplete="street-address" value={values.address}
          onChange={(event) => updateField("address", event.target.value)} aria-invalid={Boolean(errors.address)} />
        {errors.address && <p className="error-message" role="alert">{errors.address}</p>}

        <button className="primary-button" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creando cuenta…" : "Crear cuenta"}
        </button>
        {formError && <p className="error-message" role="alert">{formError}</p>}
        <p className="page-description">¿Ya tienes una cuenta? <Link href="/login">Inicia sesión</Link></p>
      </form>
    </main>
  );
}
