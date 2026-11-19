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
  const [hasSession, setHasSession] = useState(false);
  const [checkedSession, setCheckedSession] = useState(false);

  // Revisa el token cada vez que se abre o cambia una página protegida.
  useEffect(() => {
    if (isPublicPage) {
      setCheckedSession(true);
      return;
    }

    if (getToken()) {
      setHasSession(true);
      setCheckedSession(true);
    } else {
      setHasSession(false);
      setCheckedSession(true);
      router.replace("/login");
    }
  }, [isPublicPage, pathname, router]);

  /** Borra la sesión y devuelve a la pantalla de inicio de sesión. */
  function handleLogout() {
    removeToken();
    setHasSession(false);
    router.replace("/login");
  }

  if (isPublicPage) return children;
  if (!checkedSession || !hasSession) {
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
