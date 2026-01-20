import { typeSyncEnum } from "@src/enums/typeSync.enum";
import { syncEventInstance } from "@src/event/syncEvent";
import { logger } from "@src/providers/logger.provider";
import { connectDb } from "@src/providers/prisma";
import { PlaylistService } from "@src/services/playlist.service";
import { StorageService } from "@src/services/storage.service";
import { SyncService } from "@src/services/sync.service";
import TokenService from "@src/services/token.service";
import Elysia from "elysia";
import { authPlugin } from "./auth.plugin";

export const startApp = new Elysia().use(authPlugin).onStart(async function () {
  // if (!(await TokenService.tokenApiExists())) {
  //   await TokenService.createApiKey(startApp.decorator.jwt);
  // }
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
});
