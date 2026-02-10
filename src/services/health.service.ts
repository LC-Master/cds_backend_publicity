/**
 * @module Health Service
 * @description
 * Servicio encargado de reportar el estado de salud al CMS y recolectar métricas internas.
 */
import { CONFIG } from "@src/config/config";
import { logger } from "../providers/logger.provider";
import { prisma } from "../providers/prisma";
import { StorageService } from "./storage.service";
import { MediaRepository } from "@src/repository/media.repository";
import { fetchAuth } from "@src/providers/fetchAuth";
import { healthEnum } from "@src/enums/health.enum";
import { healthSchema, IHealth } from "@src/schemas/health.schema";
import crypto from 'node:crypto';

export abstract class HealthService {
  /**
   * Recolecta métricas y las envía al endpoint de health del CMS.
   * Maneja errores internamente y registra resultados.
   */
  public static async isHealthy(status: healthEnum, start_at: Date | null, end_at: Date | null): Promise<void> {
    try {
      const [media, syncState, lastPlaylist, mediaCount] = await Promise.all([
        MediaRepository.getFilesWithError(),
        prisma.syncState.findUnique({ where: { id: 1 } }),
        prisma.playlistData.findUnique({ where: { id: 1 } }),
        MediaRepository.getCount()
      ]);
      let keyPaseto = null;

      if (!syncState?.communicationKeyWasSended) {
        logger.info("First sync detected: Generating unique M2M communication key");

        keyPaseto = crypto.generateKeyPairSync('ed25519');
      }

      const dtoChanged = lastPlaylist?.version !== syncState?.syncVersion;

      const health: IHealth = {
        disk: StorageService.getDiskInfo(),
        start_at,
        end_at,
        dtoChanged,
        syncState: status,
        uptime: process.uptime(),
        mediaCount: mediaCount,
        communicationKey: keyPaseto?.privateKey.export({ type: 'pkcs8', format: 'der' })
          .subarray(-32)
          .toString('hex')
          || null,
        mediaError: media.length > 0 ? media : null,
        reported_at: new Date()
      };

      const validation = healthSchema.safeParse(health);

      if (!validation.success) {
        logger.error({ message: "Health data validation failed", error: validation.error.issues });
        return;
      }

      const path = CONFIG.CMS_BASE_URL + "/center/health";

      const response = await fetchAuth(path, {
        body: validation.data,
        method: "POST",
      });

      if (!response) {
        logger.error(
          `Health check reporting failed - No response from CMS at ${path}`
        );
        return;
      }
      if (response && !syncState?.communicationKeyWasSended) {
        await prisma.syncState.update({
          where: { id: 1 },
          data: {
            communicationKeyWasSended: true,
            communicationKey: keyPaseto?.publicKey.export({ type: 'spki', format: 'der' })
              .subarray(-32)
              .toString('hex')
          },
        });
        logger.info("Communication key registered and confirmed by CMS");
      }
      logger.info({
        message: "Health check reported successfully",
        status,
        time: new Date().toLocaleString(),
      });
    } catch (err) {
      logger.error(`Health check failed: ${err}`);
    }
  }
}
