/**
 * @module Log Middleware
 * @description
 * Middleware simple que registra cada petición entrante con timestamp y URL.
 */
import { Elysia } from "elysia";
import { logger } from "../providers/logger.provider";

export const logMiddleware = new Elysia().onRequest(({ request }) => {
  const pathname = new URL(request.url).pathname;
  if (pathname.startsWith("/api/media")) return;
  logger.info(`[${new Date().toISOString()}] ${request.method} ${request.url}`);
});
