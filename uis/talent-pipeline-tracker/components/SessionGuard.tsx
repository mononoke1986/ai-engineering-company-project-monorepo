"use client";

import Link from "next/link";
import { Suspense } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import { clearToken, getToken } from "@/lib/auth";

const PUBLIC_PATHS = ["/login", "/register"];

/** Comprueba en el navegador que exista un token antes de mostrar páginas privadas. */
function SessionGuardContent({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isPublicPage = PUBLIC_PATHS.includes(pathname);
  const [sessionCheck, setSessionCheck] = useState<{
    pathname: string;
    status: "checking" | "authenticated" | "unauthenticated" | "error";
    message?: string;
  } | null>(null);
  const [attempt, setAttempt] = useState(0);

  // Sin token no llamamos a la API; con token verificamos que la sesión siga vigente.
  useEffect(() => {
    if (isPublicPage) return;

    let isCurrent = true;
    const token = getToken();
    if (!token) {
      router.replace("/login");
      // Se actualiza después del efecto: no dejamos el indicador de carga si la
      // navegación tarda, y evitamos una actualización síncrona dentro del efecto.
      void Promise.resolve().then(() => {
        if (isCurrent) setSessionCheck({ pathname, status: "unauthenticated" });
      });
      return () => {
        isCurrent = false;
      };
    }

    const controller = new AbortController();
    let timedOut = false;
    const timeoutId = window.setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, 10_000);

    async function validateSession() {
      try {
        const response = await fetch("/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });

        if (response.status === 401) {
          clearToken();
          if (isCurrent) setSessionCheck({ pathname, status: "unauthenticated" });
          router.replace("/login");
          return;
        }
        if (!response.ok) {
          throw new Error("No se pudo comprobar la sesión. Inténtalo de nuevo.");
        }

        if (isCurrent) setSessionCheck({ pathname, status: "authenticated" });
      } catch (error) {
        if (!isCurrent || (controller.signal.aborted && !timedOut)) return;
        setSessionCheck({
          pathname,
          status: "error",
          message: timedOut
            ? "La comprobación de sesión tardó demasiado. Comprueba tu conexión e inténtalo de nuevo."
            : error instanceof Error
              ? error.message
              : "No se pudo comprobar la sesión. Comprueba tu conexión e inténtalo de nuevo.",
        });
      } finally {
        window.clearTimeout(timeoutId);
      }
    }

    void validateSession();
    return () => {
      isCurrent = false;
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [attempt, isPublicPage, pathname, router]);

  function handleLogout() {
    clearToken();
    setSessionCheck({ pathname, status: "unauthenticated" });
    router.replace("/login");
  }

  if (isPublicPage) return children;

  // Nunca reutilizamos el resultado de otra ruta ni mostramos contenido sin validar.
  if (sessionCheck?.pathname !== pathname || sessionCheck.status === "checking") {
    return (
      <main className="mx-auto w-full max-w-6xl px-4 py-8 text-slate-600">
        <p role="status">Comprobando sesión…</p>
      </main>
    );
  }
  if (sessionCheck.status === "unauthenticated") return null;
  if (sessionCheck.status === "error") {
    return (
      <main className="mx-auto w-full max-w-6xl px-4 py-8 text-slate-600">
        <p role="alert">{sessionCheck.message}</p>
        <button
          type="button"
          onClick={() => {
            setSessionCheck({ pathname, status: "checking" });
            setAttempt((current) => current + 1);
          }}
          className="mt-3 rounded-md bg-teal-700 px-3 py-2 text-sm font-medium text-white"
        >
          Reintentar
        </button>
      </main>
    );
  }

  return (
    <>
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link href="/" className="font-semibold text-teal-800" aria-label="HealthCore, página principal">
            HealthCore · People
          </Link>
          <nav className="flex items-center gap-4 text-sm" aria-label="Navegación de cuenta">
            <Link href="/account/profile" className="font-medium text-teal-700 hover:underline">
              Mi perfil
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="font-medium text-slate-700 hover:text-slate-950"
            >
              Cerrar sesión
            </button>
          </nav>
        </div>
      </header>
      {children}
    </>
  );
}

/** usePathname puede esperar a la URL en rutas dinámicas: Suspense permite generar el build. */
export function SessionGuard({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={
        <main className="mx-auto w-full max-w-6xl px-4 py-8 text-slate-600">
          <p role="status">Comprobando sesión…</p>
        </main>
      }
    >
      <SessionGuardContent>{children}</SessionGuardContent>
    </Suspense>
  );
}