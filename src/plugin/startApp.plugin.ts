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
import { dlopen } from "bun:ffi";

const kernel32 = process.platform === "win32"
  ? dlopen("kernel32.dll", {
      GetCurrentProcess: {
        args: [],
        returns: "ptr",
      },
      SetProcessWorkingSetSize: {
        args: ["ptr", "usize", "usize"],
        returns: "bool",
      },
    })
  : null;

export function forceWindowsShrink() {
  if (!kernel32) return;
  try {
    const handle = kernel32.symbols.GetCurrentProcess();
    const SHRINK_VALUE = BigInt("18446744073709551615");
    const success = kernel32.symbols.SetProcessWorkingSetSize(
      handle,
      SHRINK_VALUE,
      SHRINK_VALUE
    );

    if (success) {
      logger.info("Windows RAM 'Shrink' successful. RSS reduced.");
    }
  } catch (err: any) {
    logger.warn({
      message: "Could not perform Windows memory shrink",
      error: err.message,
    });
  }
}
/**
 * @module Start App Plugin
 * @description
 * Plugin de arranque que ejecuta tareas iniciales (sync, limpieza, etc.) al iniciar la app.
 */
export const startApp = new Elysia().use(authPlugin).onStart(async function () {
  await SseTokenService.bootstrapSecurity();
  if (!(await TokenService.tokenApiExists())) {
    await TokenService.createApiKey(startApp.decorator.jwt);
  }
  if (!await connectDb()) {
    logger.fatal("cannot connect to database, exiting...");
    process.exit(1);
  }
  await StorageService.createLogDirIfNotExists();

  await StorageService.cleanTempFolder();

  await SyncService.checkSyncInStartup();

  await StorageService.retryFailedDownloads();

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

      if (process.platform === "win32") {
        try {
          Bun.gc(true);
          forceWindowsShrink();
        } catch (err) {
          logger.warn({
            message: "Windows shrink failed",
            error: (err as Error)?.message ?? String(err),
          });
        }
      }
  }
});
