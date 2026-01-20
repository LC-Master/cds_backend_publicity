/**
 * @module File Stream Provider
 * @description
 * Proveedor que descarga el recurso binario del CMS con timeout y validaciones.
 */
import ms from "ms";
import { logger } from "./logger.provider";
import { CONFIG } from "@src/config/config";

/**
 * Descarga el recurso del CMS y devuelve la respuesta para su procesamiento.
 * @param {string} id - ID de media a descargar.
 * @returns {Promise<Response>} Response del fetch con el contenido.
 */
export default async function fileStreamProvider(id: string) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), ms("30s"));
  try {
    const res = await fetch(`${CONFIG.CMS_MEDIA_BASE_URL}/${id}`, {
      method: "GET",
      headers: {
        Accept: "application/json, application/octet-stream",
        Authorization: `Bearer ${CONFIG.API_KEY_CMS}`,
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
  } catch (error: any) {
    error.name === "AbortError" &&
      logger.error(`[fileStreamProvider] Timeout al descargar ID ${id}`);
    logger.error({
      message: `[fileStreamProvider] Error al descargar ID ${id}: ${error}`,
    });
    throw error;
  }
}
