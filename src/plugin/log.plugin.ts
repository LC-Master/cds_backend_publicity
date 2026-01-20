/**
 * @module Log Plugin
 * @description
 * Plugin que inyecta el logger a través de la derivación global del servidor.
 */
import { logger } from "@src/providers/logger.provider";
import Elysia from "elysia";

export const logPlugin = new Elysia().derive({ as: "global" }, () => ({
  log: logger,
}));
