import ms from "ms";

export default async function fileStreamProvider(id: string) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), ms("30s"));
  try {
    const res = await fetch(`${Bun.env.CMS_MEDIA_BASE_URL}/${id}`, {
      method: "GET",
      headers: {
        Accept: "application/json, application/octet-stream",
        Authorization: `Bearer ${Bun.env.API_KEY_CMS}`,
        "X-Requested-With": "XMLHttpRequest",
        Connection: "keep-alive",
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`Auth Error: ${res.status} - Verifica el Token en .env`);
    }

    const contentType = res.headers.get("content-type");
    if (contentType?.includes("text/html")) {
      throw new Error(
        "Laravel devolvió HTML (posible página de login). Revisa permisos de API."
      );
    }

    return res;
  } catch (error) {
    error === "AbortError" &&
      console.error(`[fileStreamProvider] Timeout al descargar ID ${id}`);
    console.error(`[fileStreamProvider] Error crítico en ID ${id}:`, error);
    throw error;
  }
}
