import Elysia from "elysia";
import cron from "@elysiajs/cron";
import { syncEventInstance } from "../event/syncEvent";
import { StorageService } from "../services/storage.service";
import { logger } from "../providers/logger.provider";
import { SyncService } from "../services/sync.service";
import { PlaylistService } from "../services/playlist.service";
import { prisma } from "../providers/prisma";
import { typeSyncEnum } from "../enums/typeSync.enum";
let isRetrying = false;
export const syncCrons = new Elysia()
  .use(
    cron({
      name: "Async playlist every day at 5AM",
      pattern: "0 5 * * *",
      timezone: "America/Caracas",
      run: async () => {
        logger.info({
          message: "Starting daily sync",
          time: new Date().toLocaleString(),
        });
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
          logger.error({ message: `Sync failed (cron 5AM): ${err.message}` });
        } finally {
          logger.info({
            message: "Daily sync finished",
            time: new Date().toLocaleString(),
          });
        }
      },
    })
  )
  .use(
    cron({
      name: "Async playlist every day at 12PM",
      pattern: "0 12 * * *",
      run: async () => {
        logger.info({
          message: "Starting daily sync",
          time: new Date().toLocaleString(),
        });
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
          logger.error({ message: `Sync failed (cron 12PM): ${err.message}` });
        } finally {
          logger.info({
            message: "Daily sync finished",
            time: new Date().toLocaleString(),
          });
        }
      },
    })
  )
  .use(
    cron({
      name: "Generate Playlist Every Hour",
      pattern: "0 * * * *",
      run: async () => {
        try {
          const syncState = await prisma.syncState.findUnique({
            where: { id: 1 },
          });
          if (!syncState?.syncing) {
            const dto = await prisma.playlistData.findUnique({
              where: { id: 1 },
            });
            if (dto) {
              await PlaylistService.generate(JSON.parse(dto.rawJson));
              syncEventInstance.emit("playlist:generated", true);
              logger.info({
                message: "Playlist generated successfully",
                time: new Date().toLocaleString(),
              });
            }
          }
        } catch (err) {
          logger.error({ message: `Playlist generation failed: ${err}` });
        }
      },
    })
  )
  .use(
    cron({
      name: "Retry_failed_downloads_every_hour",
      pattern: "0 * * * *",
      run: async () => {
        if (isRetrying) return;
        isRetrying = true;
        try {
          await StorageService.retryFailedDownloads();
        } finally {
          isRetrying = false;
        }
      },
    })
  );
