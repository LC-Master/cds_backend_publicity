import { logger } from "@src/providers/logger.provider";
import Elysia from "elysia";

export const logPlugin = new Elysia().derive({ as: "global" }, () => ({
  log: logger,
}));
