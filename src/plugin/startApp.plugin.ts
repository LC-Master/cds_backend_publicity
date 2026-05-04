import { syncEventInstance } from "@src/event/syncEvent";
import { logger } from "@src/providers/logger.provider";
import { connectDb } from "@src/providers/prisma";
import { PlaylistService } from "@src/services/playlist.service";
import { StorageService } from "@src/services/storage.service";
import { SyncService } from "@src/services/sync.service";
import TokenService from "@src/services/token.service";
import Elysia from "elysia";
import { authPlugin } from "./auth.plugin";
import { SseTokenService } from "@src/services/sse-token.service";

/**
 * @module Start App Plugin
 * @description
 * Plugin de arranque que ejecuta tareas iniciales (sync, limpieza, etc.) al iniciar la app.
 */
export const startApp = new Elysia().use(authPlugin).onStart(async function () {
  try {
    await SseTokenService.bootstrapSecurity();
    if (!await connectDb()) {
      logger.fatal("cannot connect to database, exiting...");
      process.exit(1);
    }
    await TokenService.createApiKey(startApp.decorator.jwt);
    await StorageService.createLogDirIfNotExists();

    await StorageService.cleanTempFolder();

    await SyncService.checkSyncInStartup();

    await StorageService.retryFailedDownloads();
  } catch (err: any) {
    logger.fatal({ message: "Startup initialization failed", error: err.message });
    process.exit(1);
  }

  try {
    const result = await SyncService.syncData();
    if (result) {
      await PlaylistService.generate(result);
      syncEventInstance.emit("dto:updated", true);
    }
  } catch (err: any) {
    logger.error({ message: `Startup sync failed: ${err.message}` });
  } finally {
    logger.info({
      message: "Startup sync finished",
      time: new Date().toLocaleString(),
    });
    if (Bun.env.ENABLE_MANUAL_GC === "true" && typeof global.gc === "function") {
      try {
        global.gc();
        logger.info("Manual GC triggered after startup.");
      } catch (gcErr) {
        logger.warn({ message: "Manual GC failed", error: (gcErr as Error).message });
      }
    }
  }
});
