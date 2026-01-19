import { logger } from "@src/providers/logger.provider";
import Elysia from "elysia";

export const log = new Elysia().derive({ as: "global" }, () => ({
    log: logger,
  }))