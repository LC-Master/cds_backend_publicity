import { Elysia } from "elysia";
import { syncCrons } from "@crons/sync.crons";
import { healthRoute } from "@routes/health.route";
import { logMiddleware } from "@middlewares/log.middleware";
import cors from "@elysiajs/cors";
import { eventsRoute } from "@routes/events.route";
import { mediaRoute } from "@routes/media.route";
import { StorageService } from "@services/storage.service";
import { logger } from "@providers/logger.provider";
import { shutdown } from "@lib/shutdown";
import { forceRoute } from "@routes/force.route";
import { typeSyncEnum } from "@enums/typeSync.enum";
import { syncEventInstance } from "@event/syncEvent";
import { PlaylistService } from "@services/playlist.service";
import { SyncService } from "@services/sync.service";
import { playlistRoute } from "@routes/playlist.route";
import { connectDb } from "@providers/prisma";
import { CONFIG } from "@config/config";
import { auth } from "@plugin/auth.plugin";
import TokenService from "@services/token.service";
import { log } from "./plugin/log.plugin";
import openapi, { fromTypes } from "@elysiajs/openapi";

export const app = new Elysia({ prefix: "/api" })
  .use(log)
  .use(auth)
  .onStart(async function () {
    if (!(await TokenService.tokenApiExists())) {
      await TokenService.createApiKey(app.decorator.jwt);
    }
    // const isConnected = await connectDb();
    // if (!isConnected) {
    //   logger.fatal("cannot connect to database, exiting...");
    //   process.exit(1);
    // }
    // await StorageService.createLogDirIfNotExists();

    // await StorageService.cleanTempFolder();

    // await StorageService.retryFailedDownloads();

    // try {
    //   const result = await SyncService.syncData();
    //   if (
    //     result?.dto &&
    //     (result.type === typeSyncEnum.noChange ||
    //       result.type === typeSyncEnum.newSync)
    //   ) {
    //     await PlaylistService.generate(result.dto);
    //     syncEventInstance.emit("dto:updated", true);
    //   }
    // } catch (err: any) {
    //   logger.error({ message: `Startup sync failed: ${err.message}` });
    // } finally {
    //   logger.info({
    //     message: "Startup sync finished",
    //     time: new Date().toLocaleString(),
    //   });
    // }
  })
  .use(
    cors({
      origin: CONFIG.SERVER_NEXT_PUBLIC_PRICE_CHECKER_URL,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    })
  )
  .use(
    openapi({
      references: fromTypes(
        process.env.NODE_ENV === "production"
          ? "dist/index.d.ts"
          : "src/index.ts"
      ),
    })
  )
  .use(logMiddleware)
  .use(healthRoute)
  .use(mediaRoute)
  .use(forceRoute)
  .use(playlistRoute)
  .use(eventsRoute)
  .use(syncCrons);

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
