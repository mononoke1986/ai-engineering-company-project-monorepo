import { getToken, removeToken } from "./auth";

/** Hace una petición autenticada a las rutas locales que Next reenvía a la API. */
export async function apiRequest(path: string, init: RequestInit = {}): Promise<Response> {
  const token = getToken();
  if (!token) {
    window.location.assign("/login");
    throw new Error("Inicia sesión para continuar.");
  }

  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(path, { ...init, headers });
  if (response.status === 401) {
    removeToken();
    window.location.assign("/login");
    throw new Error("Tu sesión ha caducado. Inicia sesión de nuevo.");
  }

  return response;
}
