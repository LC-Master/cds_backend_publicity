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

        logger.warn({
          message: "Sync TTL expired. Overriding stale sync.",
          timeStamp: `${diffHours.toFixed(2)}h`,
        });
      }

      const hasNoChanges = row?.syncVersion === incomingVersion;
      if (hasNoChanges && playlistData) {
        logger.info({
          message: `Sync skipped: Version already up to date.`,
          id: incomingVersion,
        });
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
   * Comprueba y normaliza el estado de sincronización durante el arranque de la app.
   * - Si no existe registro, se inicializa uno por defecto.
   * - Si había una sync en progreso, se marca como fallida y se registra un mensaje.
   */
  public static async checkSyncInStartup(): Promise<void> {
    const row = await prisma.syncState.findUnique({ where: { id: 1 } });

    const wasInProgress =
      row?.status === syncStateEnum.InProgress && !!row?.syncStartedAt;

    if (!row) {
      logger.info({
        message: "No sync state found at startup. Initializing default state.",
      });
    } else if (wasInProgress) {
      const elapsedHours = (
        (Date.now() - row.syncStartedAt!.getTime()) /
        1000 /
        60 /
        60
      ).toFixed(2);

      logger.warn({
        message:
          "Detected in-progress sync at startup. Marking as failed due to server restart.",
        previousStatus: row.status,
        syncVersion: row.syncVersion ?? null,
        syncStartedAt: row.syncStartedAt,
        elapsedHours,
      });
    } else {
      logger.info({
        message: "Sync state at startup",
        previousStatus: row!.status,
        syncVersion: row!.syncVersion ?? null,
        syncStartedAt: row!.syncStartedAt ?? null,
        errorMessage: row!.errorMessage ?? null,
      });
    }

    const newStatus =
      row?.status === syncStateEnum.InProgress
        ? syncStateEnum.Failed
        : row?.status ?? syncStateEnum.Completed;

    const newErrorMessage =
      row?.status === syncStateEnum.InProgress
        ? "Sync interrupted due to server restart"
        : row?.errorMessage ?? null;

    try {
      const result = await prisma.syncState.upsert({
        where: { id: 1 },
        update: {
          syncing: false,
          syncStartedAt: null,
          status: newStatus,
          errorMessage: newErrorMessage,
        },
        create: {
          id: 1,
          syncing: false,
          syncStartedAt: null,
          status: syncStateEnum.Completed,
          errorMessage: null,
        },
      });

      logger.info({
        message: "Sync state updated during startup check",
        newStatus: result.status,
        syncing: result.syncing,
        syncVersion: result.syncVersion ?? null,
        errorMessage: result.errorMessage ?? null,
      });
    } catch (err: any) {
      logger.error({
        message: "Failed to update sync state during startup check",
        error: err?.message ?? String(err),
      });
      throw err;
    }
  }
  /**
   * Ejecuta la sincronización completa: descarga DTO, verifica cambios, descarga archivos y guarda versión.
   * @returns {Promise<ISnapshotDto | null>} Resultado de la sincronización o null si no procede.
   */
  public static async syncData(): Promise<ISnapshotDto | null> {
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

      logger.info({
        message: "Found media entries in DTO to verify",
        media: mediaList.length,
      });

      const syncedFiles = await MediaService.getMissingFiles(
        mediaList,
        forcedMissingIds
      );

      if (syncedFiles.length > 0) {
        logger.info({
          message: "After checking DB files need to be downloaded",
          syncedFiles,
        });

        const files = await StorageService.downloadAndVerifyFiles(syncedFiles);

        logger.info({
          message: "Download finished",
          filesReceived: files.length,
        });

        const savedFiles = await MediaRepository.saveMany(files);
        logger.info({
          message: "Sync completed",
          filesProcessed: savedFiles.length,
        });
      }

      logger.info({
        message: "Sync Completed Successfully",
        version: dto.meta.version,
      });

      await PlaylistDataRepository.saveVersion(dto);
    } catch (err: { message: string } | any) {
      logger.error({ message: `Sync failed services`, error: err.message });
      return null;
    } finally {
      await this.finishSync(dto.meta.version);
      await StorageService.cleanTempFolder();
    }

    return dto;
  }
}
