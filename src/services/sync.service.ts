/**
 * @module Sync Service
 * @description
 * Servicio responsable del ciclo de sincronización: iniciar transacción de sync,
 * decidir si se debe sincronizar, y ejecutar la descarga y persistencia de archivos.
 * Documentación en español; no se modifica la lógica.
 */
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

function extractMediaList(dto: ISnapshotDto) {
  const mediaList = dto.data.campaigns
    .map((campaign) => [...campaign.slots.am, ...campaign.slots.pm])
    .flat();

  return mediaList ? mediaList : undefined;
}

/**
 * @class SyncService
 * @author Francisco A. Rojas F.
 * @description
 * Coordina la integridad entre el CMS (SQL Server), la DB local (Prisma) y el sistema de archivos.
 * Implementa lógica de auto-recuperación: si la media física no existe, fuerza la descarga
 * aunque la versión del DTO no haya cambiado.
 */
export abstract class SyncService {
  private static readonly SYNC_TTL_HOURS = CONFIG.SYNC_TTL_HOURS;

  /**
   * Intenta iniciar una sincronización en la DB, respetando TTL y versión.
   * @param {string} incomingVersion - Versión del DTO entrante.
   * @returns {Promise<{ canSync: boolean; type: typeSyncEnum }>} Indica si se puede sincronizar y el tipo.
   */
  static async tryStartSync(
    incomingVersion: string
  ): Promise<{ canSync: boolean; type: typeSyncEnum }> {
    const now = new Date();
    return prisma.$transaction(async (tx) => {
      const row = await tx.syncState.findUnique({ where: { id: 1 } });
      const playlistData = await tx.playlistData.findUnique({
        where: { id: 1 },
      });
      if (row) {
        if (row.syncing && row.syncStartedAt) {
          const diffHours =
            (now.getTime() - row.syncStartedAt.getTime()) / 1000 / 60 / 60;
          if (diffHours < this.SYNC_TTL_HOURS)
            return { canSync: false, type: typeSyncEnum.Syncing };
        }

        if (row.syncVersion === incomingVersion) {
          if (!playlistData) {
            logger.warn(
              "SyncState reports noChange but PlaylistData is missing. Proceeding to sync to recover missing data."
            );
            return { canSync: true, type: typeSyncEnum.newSync };
          }
          return { canSync: false, type: typeSyncEnum.noChange };
        }
        
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

  /**
   * Marca la sincronización como finalizada en la DB (éxito o fallo).
   * @param {string} version - Versión que se guardará en el estado de sync.
   * @param {string} [error] - Mensaje de error opcional si la sync falló.
   */
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
  /**
   * Ejecuta la sincronización completa: descarga DTO, verifica cambios, descarga archivos y guarda versión.
   * @returns {Promise<  ISnapshotDto   | null>} Resultado de la sincronización o null si no procede.
   */
  static async syncData(): Promise<ISnapshotDto | null> {
    const dto = await fetchDto<ISnapshotDto>(CONFIG.CMS_ROUTE_SNAPSHOT);
    if (!dto) {
      logger.warn("Failed to fetch DTO from CMS.");
      throw new Error("Failed to fetch DTO");
    }
    const canSync = await this.tryStartSync(dto.meta.version);
    if (!canSync.canSync && canSync.type === typeSyncEnum.Syncing) {
      logger.info("Sync already in progress. Aborting new sync attempt.");
      return null;
    }
    if (!canSync.canSync && canSync.type === typeSyncEnum.noChange) {
      logger.info("No changes detected in DTO version. Sync not required.");
      return dto;
    }

    try {
      const mediaList = extractMediaList(dto);

      if (!mediaList || mediaList.length === 0) {
        throw new Error("DTO contains no media entries to process.");
      }

      logger.info(`Found ${mediaList.length} media entries in DTO.`);

      const syncedFiles = await StorageService.getMissingFiles(mediaList);
      logger.info(
        `After checking DB, ${syncedFiles.length} files need to be downloaded.`
      );

      const files = await StorageService.downloadAndVerifyFiles(syncedFiles);
      logger.info(`Download finished: received ${files.length} file results.`);

      const savedFiles = await MediaRepository.saveMany(files);

      logger.info(
        `Sync completed: ${savedFiles.length} media files processed.`
      );
    } catch (err: { message: string } | any) {
      logger.error(`Sync failed services: ${err.message}`);
      return null;
    } finally {
      await PlaylistDataRepository.saveVersion(dto);
      await this.finishSync(dto.meta.version);
      await StorageService.cleanTempFolder();
    }

    return dto;
  }
}
