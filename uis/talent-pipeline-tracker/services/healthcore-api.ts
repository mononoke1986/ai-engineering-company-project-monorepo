import { clearToken, getToken } from "@/lib/auth";

/** Llama a HealthCore con el token y devuelve a /login si la sesión ya no sirve. */
export async function healthcoreRequest(
  path: string,
  init: RequestInit = {}
): Promise<Response> {
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${getToken() ?? ""}`);

  const response = await fetch(`/healthcore-api${path}`, {
    ...init,
    headers,
  });

  if (response.status === 401) {
    clearToken();
    window.location.assign("/login");
  }

  return response;
}
