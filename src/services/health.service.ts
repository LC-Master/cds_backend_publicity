/**
 * @module Health Service
 * @description
 * Servicio encargado de reportar el estado de salud al CMS y recolectar métricas internas.
 */
import { CONFIG } from "@src/config/config";
import { IFile } from "../../types/file.type";
import { logger } from "../providers/logger.provider";
import { prisma } from "../providers/prisma";
import { StorageService } from "./storage.service";

type IHealth = {
  disk: {
    size: number;
    free: number;
    used: number;
  };
  isSync: boolean;
  dtoChanged: boolean;
  uptime: number;
  mediaCount: number;
  mediaError: IFile[];
};

export abstract class HealthService {
  /**
   * Recolecta métricas y las envía al endpoint de health del CMS.
   * Maneja errores internamente y registra resultados.
   */
  public static async isHealthy(): Promise<void> {
    try {
      StorageService.getDiskInfo();

      const media = await prisma.media.findMany({
        where: {
          isDownloaded: false,
          errorCount: { lt: 5 },
        },
        select: { id: true, name: true, checksum: true },
      });
      const syncState = await prisma.syncState.findUnique({ where: { id: 1 } });
      const lastPlaylist = await prisma.playlistData.findUnique({
        where: { id: 1 },
      });

      const isSync = syncState?.syncing ?? false;
      const dtoChanged = lastPlaylist?.version !== syncState?.syncVersion;

      const mediaCount = await prisma.media.count();

      const health: IHealth = {
        disk: StorageService.getDiskInfo(),
        dtoChanged,
        isSync,
        uptime: process.uptime(),
        mediaCount: mediaCount,
        mediaError: media,
      };

      const response = await fetch(CONFIG.CMS_BASE_URL + "/center/health", {
        method: "POST",
        body: JSON.stringify(health),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        logger.error(
          `Health check reporting failed with status: ${response.status}`
        );
      }
      logger.info({
        message: "Health check reported successfully",
        time: new Date().toLocaleString(),
      });
    } catch (err) {
      logger.error(`Health check failed: ${err}`);
    }
  }
}
