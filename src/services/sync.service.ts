import { CONFIG } from "@src/config/config";
import { ISnapshotDto } from "../../types/dto.type";
import { syncStateEnum } from "../enums/syncState.enum";
import { typeSyncEnum } from "../enums/typeSync.enum";
import { fetchDto } from "../providers/fetchDto";
import { logger } from "../providers/logger.provider";
import { prisma } from "../providers/prisma";
import { MediaRepository } from "../repository/media.repository";
import { PlaylistDataRepository } from "../repository/playlistData.repository";
import { StorageService } from "./storage.service";

export abstract class SyncService {
  private static readonly SYNC_TTL_HOURS = CONFIG.SYNC_TTL_HOURS;

  static async tryStartSync(
    incomingVersion: string
  ): Promise<{ canSync: boolean; type: typeSyncEnum }> {
    const now = new Date();

    return prisma.$transaction(async (tx) => {
      const row = await tx.syncState.findUnique({ where: { id: 1 } });

      if (row) {
        if (row.syncing && row.syncStartedAt) {
          const diffHours =
            (now.getTime() - row.syncStartedAt.getTime()) / 1000 / 60 / 60;
          if (diffHours < this.SYNC_TTL_HOURS)
            return { canSync: false, type: typeSyncEnum.Syncing };
        }

        if (row.syncVersion === incomingVersion)
          return { canSync: false, type: typeSyncEnum.noChange };
        await tx.syncState.update({
          where: { id: 1 },
          data: {
            syncing: true,
            syncStartedAt: now,
            syncVersion: incomingVersion,
            status: syncStateEnum.InProgress,
            errorMessage: null,
          },
        });

        return { canSync: true, type: typeSyncEnum.newSync };
      }

      await tx.syncState.create({
        data: {
          id: 1,
          syncing: true,
          syncStartedAt: now,
          syncVersion: incomingVersion,
          status: syncStateEnum.InProgress,
        },
      });

      return { canSync: true, type: typeSyncEnum.newSync };
    });
  }

  static async finishSync(version: string, error?: string) {
    await prisma.syncState.upsert({
      where: { id: 1 },
      update: {
        syncing: false,
        syncStartedAt: null,
        syncVersion: version,
        status: error ? syncStateEnum.Failed : syncStateEnum.Completed,
        errorMessage: error ?? null,
      },
      create: {
        id: 1,
        syncing: false,
        syncStartedAt: null,
        syncVersion: version,
        status: error ? syncStateEnum.Failed : syncStateEnum.Completed,
        errorMessage: error ?? null,
      },
    });
  }
  static async syncData(): Promise<{
    dto: ISnapshotDto;
    type: typeSyncEnum;
  } | null> {
    const dto = await fetchDto<ISnapshotDto>(CONFIG.CMS_ROUTE_SNAPSHOT);
    if (!dto) {
      logger.warn("Failed to fetch DTO from CMS.");
      throw new Error("Failed to fetch DTO");
    }
    const canSync = await this.tryStartSync(dto.meta.version);
    if (!canSync.canSync && canSync.type == typeSyncEnum.Syncing) {
      logger.info("Sync already in progress. Aborting new sync attempt.");
      return null;
    }
    if (!canSync.canSync && canSync.type == typeSyncEnum.noChange) {
      logger.info("No changes detected in DTO version. Sync not required.");
      return { dto, type: typeSyncEnum.noChange };
    }
    try {
      const mediaList = dto.data.campaigns
        .map((campaign) => [...campaign.slots.am, ...campaign.slots.pm])
        .flat();

      const syncedFiles = await StorageService.filesExist(mediaList);
      const files = await StorageService.downloadAndVerifyFiles(syncedFiles);
      const savedFiles = await MediaRepository.saveMany(files);

      logger.info(
        `Sync completed: ${savedFiles.length} media files processed.`
      );

      await PlaylistDataRepository.saveVersion(dto);
      await this.finishSync(dto.meta.version);
    } catch (err: { message: string } | any) {
      logger.error(`Sync failed services: ${err.message}`);
      await this.finishSync(dto.meta.version, err.message);
      throw err;
    } finally {
      await StorageService.cleanTempFolder();
    }

    return { dto, type: typeSyncEnum.newSync };
  }
}
