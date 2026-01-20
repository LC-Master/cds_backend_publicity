/**
 * @module Fetch DTO
 * @description
 * Proveedor para realizar fetch al endpoint de snapshot y validar con el esquema Zod.
 */
import ms, { StringValue } from "ms";
import { dto } from "../schemas/dto.schema";
import { logger } from "./logger.provider";
import { CONFIG } from "@src/config/config";

/**
 * Obtiene y valida el DTO desde la URL indicada.
 * @template T
 * @param {string} url - URL del endpoint que devuelve el DTO.
 * @returns {Promise<T|null>} DTO validado o null en caso de error.
 */
export const fetchDto = async <T>(url: string): Promise<T | null> => {
  const controller = new AbortController();
  const timeout = ms(
    (CONFIG.FETCH_TIMEOUT_SECONDS
      ? `${CONFIG.FETCH_TIMEOUT_SECONDS}s`
      : "30s") as StringValue
  );

  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeout);
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${CONFIG.API_KEY_CMS}`,
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      logger.error({ message: `[fetchDto] HTTP error: ${response.status}` });
      return null;
    }

    const result = dto.safeParse(await response.json());

    if (!result.success) {
      logger.error(
        {
          url,
          issues: result.error.issues,
        },
        "[fetchDto] DTO validation failed"
      );

      throw new Error("DTO validation failed");
    }
    return result.data as T;
  } catch (error) {
    logger.error({
      message: `[fetchDto] Error fetching DTO from ${url}: ${error}`,
    });
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
};
