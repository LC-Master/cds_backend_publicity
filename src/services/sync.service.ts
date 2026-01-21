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
import { extractMediaList } from "@src/lib/campaignHelpers";
import { IFile } from "../../types/file.type";
import { MediaService } from "./media.service";

/**
 * @class SyncService
 * @author Francisco A. Rojas F.
 * @description
 * Coordina la integridad entre el CMS (SQL Server), la DB local (Prisma) y el sistema de archivos.
 * Implementa lógica de auto-recuperación: si la media física no existe, fuerza la descarga
 * aunque la versión del DTO no haya cambiado.
 */
export abstract class SyncService {
  /**
   * @author Francisco A. Rojas F.
   * @description
   * Intenta iniciar la transacción de sincronización.
   * Implementa una lógica de aplanado (Early Return) para validar:
   * 1. Existencia de estado inicial.
   * 2. Bloqueo por proceso en curso (TTL).
   * 3. Integridad de la versión del DTO vs Datos persistidos.
   * * @param {string} incomingVersion - Versión del DTO proveniente del CMS.
   * @returns {Promise<{ canSync: boolean; type: typeSyncEnum }>}
   */
  public static async tryStartSync(
    incomingVersion: string
  ): Promise<{ canSync: boolean; type: typeSyncEnum }> {
    const now = new Date();

    return prisma.$transaction(async (tx) => {
      const row = await tx.syncState.findUnique({ where: { id: 1 } });
      const playlistData = await tx.playlistData.findUnique({
        where: { id: 1 },
      });

      if (row?.syncing && row.syncStartedAt) {
        const diffHours =
          (now.getTime() - row.syncStartedAt.getTime()) / 1000 / 60 / 60;

        if (diffHours < CONFIG.SYNC_TTL_HOURS) {
          logger.info({
            message: "Sync aborted: Process already in progress",
            startedAt: row.syncStartedAt,
            elapsedHours: diffHours.toFixed(2),
          });
          return { canSync: false, type: typeSyncEnum.Syncing };
        }

        logger.warn(
          `Sync TTL expired (${diffHours.toFixed(2)}h). Overriding stale sync.`
        );
      }

      const hasNoChanges = row?.syncVersion === incomingVersion;
      if (hasNoChanges && playlistData) {
        logger.info(
          `Sync skipped: Version ${incomingVersion} already up to date.`
        );
        return { canSync: false, type: typeSyncEnum.noChange };
      }

      if (!playlistData && hasNoChanges) {
        logger.warn(
          "Version match but PlaylistData is missing. Forcing recovery sync."
        );
      }

      const isFirstTime = !row;
      await tx.syncState.upsert({
        where: { id: 1 },
        update: {
          syncing: true,
          syncStartedAt: now,
          syncVersion: incomingVersion,
          status: syncStateEnum.InProgress,
          errorMessage: null,
        },
        create: {
          id: 1,
          syncing: true,
          syncStartedAt: now,
          syncVersion: incomingVersion,
          status: syncStateEnum.InProgress,
        },
      });

      logger.info({
        message: isFirstTime
          ? "First-time sync initiated"
          : "Sync state updated to InProgress",
        version: incomingVersion,
        type: isFirstTime ? "INITIAL_SYNC" : "UPDATE_SYNC",
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
   * @returns {Promise<ISnapshotDto | null>} Resultado de la sincronización o null si no procede.
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
    let forcedMissingIds: string[] = [];
    if (!canSync.canSync && canSync.type === typeSyncEnum.noChange) {
      forcedMissingIds = await MediaService.checkPhysicalMedia(dto);
      if (forcedMissingIds.length === 0) {
        logger.info("No changes detected in DTO version. Sync not required.");
        return dto;
      }
      logger.warn(
        `Physical media integrity check failed for ${forcedMissingIds.length} files. Forcing re-download.`
      );
    }

    try {
      const mediaList = extractMediaList(dto);

      if (!mediaList || mediaList.length === 0) {
        throw new Error("DTO contains no media entries to process.");
      }

      logger.info(`Found ${mediaList.length} media entries in DTO.`);

      const syncedFiles = await MediaService.getMissingFiles(
        mediaList,
        forcedMissingIds
      );

      logger.info(
        `After checking DB, ${syncedFiles.length} files need to be downloaded.`
      );

      const files = await StorageService.downloadAndVerifyFiles(syncedFiles);
      logger.info(`Download finished: received ${files.length} file results.`);

      const savedFiles = await MediaRepository.saveMany(files);

      logger.info(
        `Sync completed: ${savedFiles.length} media files processed.`
      );
      await PlaylistDataRepository.saveVersion(dto);
    } catch (err: { message: string } | any) {
      logger.error(`Sync failed services: ${err.message}`);
      return null;
    } finally {
      await this.finishSync(dto.meta.version);
      await StorageService.cleanTempFolder();
    }

    return dto;
  }
}
