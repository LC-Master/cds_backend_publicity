import { ISnapshotDto } from "../../types/dto.type";
import { syncStateEnum } from "../enums/syncState.enum";
import { fetchDto } from "../providers/fetchDto";
import { logger } from "../providers/logger.provider";
import { prisma } from "../providers/prisma";
import { MediaRepository } from "../repository/media.repository";
import { PlaylistDataRepository } from "../repository/playlistData.repository";
import { StorageService } from "./storage.service";

export abstract class SyncService {
  private static readonly SYNC_TTL_HOURS = Number(Bun.env.SYNC_TTL_HOURS ?? 2);

  static async tryStartSync(incomingVersion: string): Promise<boolean> {
    const now = new Date();

    return prisma.$transaction(async (tx) => {
      const row = await tx.syncState.findUnique({ where: { id: 1 } });

      if (row) {
        if (row.syncing && row.syncStartedAt) {
          const diffHours =
            (now.getTime() - row.syncStartedAt.getTime()) / 1000 / 60 / 60;
          if (diffHours < this.SYNC_TTL_HOURS) return false;
        }

        if (row.syncVersion === incomingVersion) return false;

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

        return true;
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

      return true;
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
  static async syncData() {
    const dto = await fetchDto<ISnapshotDto>(Bun.env.CMS_ROUTE_SNAPSHOT);
    if (!dto) {
      logger.warn("Failed to fetch DTO from CMS.");
      throw new Error("Failed to fetch DTO");
    }
    const canSync = await this.tryStartSync(dto.meta.version);
    if (!canSync) {
      logger.info("Sync already in progress or up-to-date. Skipping.");
      return dto;
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

      PlaylistDataRepository.saveVersion(dto);
      await this.finishSync(dto.meta.version);
    } catch (err: { message: string } | any) {
      logger.error(`Sync failed: ${err.message}`);
      await this.finishSync(dto.meta.version, err.message);
      throw err;
    } finally {
      await StorageService.cleanTempFolder();
    }

    return dto;
  }
}
