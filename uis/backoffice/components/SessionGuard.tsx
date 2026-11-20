"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import { getToken, removeToken } from "@/lib/auth";

const PUBLIC_PATHS = ["/login", "/register"];

/** Comprueba en el navegador que haya sesión y protege las demás páginas. */
export function SessionGuard({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isPublicPage = PUBLIC_PATHS.includes(pathname);
  const [sessionCheck, setSessionCheck] = useState<{
    pathname: string;
    hasToken: boolean;
  } | null>(null);

  // Comprueba la sesión para cada ruta protegida y nunca mezcla resultados de rutas distintas.
  useEffect(() => {
    if (isPublicPage) return;

    const hasToken = Boolean(getToken());
    setSessionCheck({ pathname, hasToken });

    if (!hasToken) {
      router.replace("/login");
    }
  }, [isPublicPage, pathname, router]);

  /** Borra la sesión y devuelve a la pantalla de inicio de sesión. */
  function handleLogout() {
    removeToken();
    setSessionCheck(null);
    router.replace("/login");
  }

  if (isPublicPage) return children;
  if (sessionCheck?.pathname !== pathname || !sessionCheck.hasToken) {
    return <main className="workspace"><p role="status">Comprobando sesión…</p></main>;
  }

  return (
    <>
      <header className="topbar workspace">
        <Link className="brand" href="/" aria-label="HealthCore, inicio">
          <span className="brand-mark" aria-hidden="true">H</span>
          <span>HealthCore<span className="brand-divider">/</span>Digital</span>
        </Link>
        <nav className="topbar-context" aria-label="Navegación de cuenta">
          <Link href="/account/profile">Mi perfil</Link>
          <button type="button" onClick={handleLogout}>Cerrar sesión</button>
        </nav>
      </header>
      {children}
    </>
  );
}
