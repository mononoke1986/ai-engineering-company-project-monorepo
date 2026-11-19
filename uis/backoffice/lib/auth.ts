const TOKEN_KEY = "healthcore_access_token";

/** Guarda el token en el navegador para conservar la sesión al recargar. */
export function saveToken(token: string): void {
  window.localStorage.setItem(TOKEN_KEY, token);
}

/** Lee el token guardado; devuelve null si no hay sesión o se ejecuta fuera del navegador. */
export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

/** Borra el token y cierra la sesión guardada en este navegador. */
export function removeToken(): void {
  window.localStorage.removeItem(TOKEN_KEY);
}
