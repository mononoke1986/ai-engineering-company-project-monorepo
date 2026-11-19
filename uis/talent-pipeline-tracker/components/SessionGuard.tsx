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
    hasToken: boolean;
  } | null>(null);

  // Guardamos la ruta junto al resultado, para comprobar cada página por separado.
  useEffect(() => {
    if (isPublicPage) return;

    const hasToken = Boolean(getToken());
    setSessionCheck({ pathname, hasToken });

    if (!hasToken) {
      router.replace("/login");
    }
  }, [isPublicPage, pathname, router]);

  function handleLogout() {
    clearToken();
    setSessionCheck(null);
    router.replace("/login");
  }

  if (isPublicPage) return children;

  // Si acabamos de cambiar de ruta, no reutilizamos el resultado de la ruta anterior.
  if (sessionCheck?.pathname !== pathname || !sessionCheck.hasToken) {
    return (
      <main className="mx-auto w-full max-w-6xl px-4 py-8 text-slate-600">
        <p role="status">Comprobando sesión…</p>
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