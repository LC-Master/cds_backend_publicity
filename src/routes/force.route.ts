import Elysia, { status, t } from "elysia";
import { syncEventInstance } from "../event/syncEvent";
import { logger } from "../providers/logger.provider";
import { PlaylistService } from "../services/playlist.service";
import { SyncService } from "../services/sync.service";
import { typeSyncEnum } from "../enums/typeSync.enum";
import { auth } from "@src/plugin/auth.plugin";
import TokenService from "@src/services/token.service";

export const forceRoute = new Elysia({ prefix: "/sync" })
  .use(auth)
  .post(
    "/force",
    async ({ body }) => {
      const { force } = body;
      logger.info({ message: "Force sync requested", force });
      if (!force) throw status(400, "Force parameter must be true");
      // Run sync in background
      (async () => {
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
            message: "Force Sync Finished",
            time: new Date().toLocaleString(),
          });
        }
      })();
      return status(200, "Force sync initiated");
    },
    {
      body: t.Object({
        force: t.Boolean(),
      }),
    }
  )
  .post(
    "/force/token",
    async ({ body, jwt }) => {
      const { generate } = body;
      if (!generate) throw status(400, "Generate parameter must be true");
      await TokenService.createApiKey(jwt);
      logger.info({ message: "Force token generation requested", generate });
      return status(200, "Force token generation initiated");
    },
    {
      body: t.Object({
        generate: t.Boolean({ error: "generate debe ser un booleano" }),
      }),
    }
  );
