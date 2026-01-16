import { Elysia } from "elysia";
import { syncCrons } from "./crons/sync.crons";
import { healthRoute } from "./routes/health.route";
import { logMiddleware } from "./middlewares/log.middleware";
import { testRoute } from "./routes/test.route";
import cors from "@elysiajs/cors";
import { eventsRoute } from "./routes/events.route";
import { mediaRoute } from "./routes/media.route";
import { StorageService } from "./services/storage.service";
import { logger } from "./providers/logger.provider";
import { shutdown } from "./lib/shutdown";

const PORT = Number(Bun.env.PORT) || 3000;

export const app = new Elysia({ prefix: "/api" })
  .derive({ as: "global" }, () => ({
    log: logger,
  }))
  .use(
    cors({
      origin: Bun.env.SERVER_NEXT_PUBLIC_PRICE_CHECKER_URL,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    })
  )
  .use(logMiddleware)
  .use(mediaRoute)
  .use(eventsRoute)
  .use(testRoute)
  .use(syncCrons)
  .use(healthRoute);

app.listen({ port: PORT }, async (server) => {
  await StorageService.createLogDirIfNotExists();
  logger.info(`🦊 Elysia is running at ${server.hostname}:${server.port}`);
});

process.on("uncaughtException", (err) => {
  logger.fatal({ err }, "Uncaught Exception");
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  logger.fatal({ reason }, "Unhandled Promise Rejection");
  process.exit(1);
});

process.on("SIGTERM", () => shutdown("SIGTERM"));

process.on("SIGINT", () => shutdown("SIGINT"));


