import Elysia, { status, t } from "elysia";
import { syncEventInstance } from "../event/syncEvent";
import { logger } from "../providers/logger.provider";
import { PlaylistService } from "../services/playlist.service";
import { SyncService } from "../services/sync.service";
import { typeSyncEnum } from "../enums/typeSync.enum";

export const forceRoute = new Elysia().post(
  "/sync/force",
  async ({ body }) => {
    const { force } = body;
    logger.info({ message: "Force sync requested", force });
    if (!force) throw status(400, "Force parameter must be true");
    try {
      const result = await SyncService.syncData();
      if (
        result?.dto &&
        (result.type === typeSyncEnum.noChange ||
          result.type === typeSyncEnum.newSync)
      ) {
        await PlaylistService.generate(result.dto);
        syncEventInstance.emit("dto:updated", true);
      }
    } catch (err: any) {
      logger.error({ message: `Force sync failed: ${err.message}` });
    } finally {
      logger.info({
        message: "Daily sync finished",
        time: new Date().toLocaleString(),
      });
      return status(200, "Force sync initiated");
    }
  },
  {
    body: t.Object({
      force: t.Boolean(),
    }),
  }
);
