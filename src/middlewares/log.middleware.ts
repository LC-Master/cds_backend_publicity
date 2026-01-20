/**
 * @module Log Middleware
 * @description
 * Middleware simple que registra cada petición entrante con timestamp y URL.
 */
import { Elysia } from "elysia";
import { logger } from "../providers/logger.provider";

export const logMiddleware = new Elysia().onRequest(({ request }) => {
  logger.info(`[${new Date().toISOString()}] ${request.method} ${request.url}`);
});
