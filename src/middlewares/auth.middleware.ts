/**
 * @module Auth Middleware
 * @description
 * Middleware global que valida el header Bearer y comprueba token/hashes en DB.
 */
import bearer from "@elysiajs/bearer";
import { authPlugin } from "@src/plugin/auth.plugin";
import { logger } from "@src/providers/logger.provider";
import TokenService from "@src/services/token.service";
import Elysia, { status } from "elysia";

export const authMiddleware = new Elysia()
  .use(authPlugin)
  .use(bearer())
  .derive({ as: "global" }, ({ server, request }) => ({
    ip: server?.requestIP(request)?.address,
  }))
  .onBeforeHandle({ as: "global" }, async ({ jwt, bearer, request, ip }) => {
    const pathname = new URL(request.url).pathname;
    if (pathname.startsWith("/api/media")) {
      return;
    }

    logger.info(`Incoming request to ${request.url} from ${ip}`);

    if (!bearer) {
      logger.warn(`Unauthorized access attempt to ${request.url} from ${ip}`);
      throw status(401, { error: "Unauthorized" });
    }

    const isValid = await TokenService.verifyBearer(bearer, jwt);

    if (!isValid) {
      logger.warn(`Invalid token access attempt to ${request.url} from ${ip}`);
      throw status(401, { error: "Unauthorized" });
    }
  });
