const TOKEN_KEY = "healthcore_access_token";

/** Guarda el token de inicio de sesión en el navegador. */
export function saveToken(token: string): void {
  window.localStorage.setItem(TOKEN_KEY, token);
}

/** Lee el token guardado; devuelve null si todavía no hay uno. */
export function getToken(): string | null {
  return window.localStorage.getItem(TOKEN_KEY);
}

/** Borra el token guardado en el navegador. */
export function clearToken(): void {
  window.localStorage.removeItem(TOKEN_KEY);
}
