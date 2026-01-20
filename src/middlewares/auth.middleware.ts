import bearer from "@elysiajs/bearer";
import { authPlugin } from "@src/plugin/auth.plugin";
import { logger } from "@src/providers/logger.provider";
import { TokenRepository } from "@src/repository/token.repository";
import TokenService from "@src/services/token.service";
import Elysia, { status } from "elysia";

export const authMiddleware = new Elysia()
  .use(authPlugin)
  .use(bearer())
  .derive({ as: "global" }, ({ server, request }) => ({
    ip: server?.requestIP(request)?.address,
  }))
  .onBeforeHandle({ as: "global" }, async ({ jwt, bearer, request, ip }) => {
    logger.info(`Incoming request to ${request.url} from ${ip}`);
    if (!bearer) {
      logger.warn(`Unauthorized access attempt to ${request.url} from ${ip}`);
      throw status(401, { error: "Unauthorized" });
    }

    const validated = await TokenService.validateToken(bearer);

    if (!validated) {
      logger.warn(`Invalid token access attempt to ${request.url} from ${ip}`);
      throw status(401, { error: "Unauthorized" });
    }

    const token = await TokenRepository.get();

    if (!token) {
      logger.error(`API key not found in database.`);
      throw status(401, { error: "Unauthorized" });
    }
    const validatedToken = await jwt.verify(bearer);

    if (!validatedToken) {
      logger.warn(`Invalid token access attempt to ${request.url} from ${ip}`);
      throw status(401, { error: "Unauthorized" });
    }

    const validatedHash = await Bun.password.verify(bearer, token);

    if (!validatedHash) {
      logger.warn(`Invalid token access attempt to ${request.url} from ${ip}`);
      throw status(401, { error: "Unauthorized" });
    }
  });
