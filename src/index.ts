import { Elysia } from "elysia";
import { syncCrons } from "@crons/sync.crons";
import { healthRoute } from "@routes/health.route";
import { logMiddleware } from "@middlewares/log.middleware";
import cors from "@elysiajs/cors";
import { eventsRoute } from "@routes/events.route";
import { mediaRoute } from "@routes/media.route";
import { logger } from "@providers/logger.provider";
import { shutdown } from "@lib/shutdown";
import { forceRoute } from "@routes/force.route";
import { playlistRoute } from "@routes/playlist.route";
import { CONFIG } from "@config/config";
import { authPlugin } from "@plugin/auth.plugin";
import { apiDoc } from "./routes/openDoc.route";
import { authMiddleware } from "./middlewares/auth.middleware";
import { startApp } from "./plugin/startApp.plugin";
import { authRoute } from "./routes/auth.route";

export const app = new Elysia({ prefix: "/api" })
  .use(apiDoc)
  .use(authPlugin)
  .use(startApp)
  .use(
    cors({
      origin: CONFIG.SERVER_NEXT_PUBLIC_PRICE_CHECKER_URL,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    })
  )
  .use(logMiddleware)
  .use(healthRoute)
  .use(eventsRoute)
  .use(authMiddleware)
  .use(authRoute)
  .use(mediaRoute)
  .use(forceRoute)
  .use(playlistRoute)
  .use(syncCrons)
  .onError(({ code, status }) => {
    if (code === "NOT_FOUND")
      return status(404, {
        message: "Route not found",
      });
  });

app.listen({ port: CONFIG.PORT }, async (server) => {
  logger.info(
    `Content Distribution Service (CDS) is running at ${server.hostname}:${server.port}`
  );
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
