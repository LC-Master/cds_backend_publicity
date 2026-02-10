/**
 * @module Fetch DTO
 * @description
 * Proveedor para realizar fetch al endpoint de snapshot.
 */
import ms, { StringValue } from "ms";
import { logger } from "./logger.provider";
import { CONFIG } from "@src/config/config";

/**
 * Realiza un fetch a la URL indicada.
 * @param {string} url - URL del endpoint que devuelve el DTO.
 * @param {RequestInit} [options] - Opciones para el fetch (headers, method, body, etc.).
 * @returns {Promise<any|null>} Respuesta JSON o null en caso de error.
 */
export const fetchAuth = async (
  url: string,
  options: Omit<RequestInit, "body"> & { body?: any } = {}
): Promise<any | null> => {
  const controller = new AbortController();
  const timeout = ms(
    (CONFIG.FETCH_TIMEOUT_SECONDS
      ? `${CONFIG.FETCH_TIMEOUT_SECONDS}s`
      : "30s") as StringValue
  );

  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeout);

  const headers = new Headers({
    Accept: "application/json",
    Authorization: `Bearer ${CONFIG.API_KEY_CMS}`,
  });

  if (options.headers) {
    new Headers(options.headers).forEach((value, key) => {
      headers.set(key, value);
    });
  }

  let body = options.body;
  const method = (options.method || "GET").toUpperCase();
  const isBodyAllowed = method !== "GET" && method !== "HEAD";

  if (
    isBodyAllowed &&
    body &&
    typeof body === "object" &&
    !(body instanceof FormData) &&
    !(body instanceof URLSearchParams) &&
    !(body instanceof Blob)
  ) {
    body = JSON.stringify(body);
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
  }

  try {
    const response = await fetch(url, {
      ...options,
      method: options.method || "GET",
      headers,
      body: isBodyAllowed ? body : undefined,
      signal: controller.signal,
    });

    if (!response.ok) {
      logger.error({ message: `[fetchAuth] HTTP error: ${response.status}` });
      return null;
    }

    return await response.json();
  } catch (error) {
    logger.error({
      message: `[fetchAuth] Error fetching DTO from ${url}: ${error}`,
    });
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
};

