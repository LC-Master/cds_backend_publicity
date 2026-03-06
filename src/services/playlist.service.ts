/**
 * @module Playlist Service
 * @description
 * Genera el archivo `playlist.json` a partir del DTO sincronizado y gestiona la limpieza de media huérfana.
 * Documentación en español; no se altera la lógica.
 */
import { Campaign, FileDto, ISnapshotDto } from "../../types/dto.type";
import { IPlaylistData } from "../../types/playlist.type";
import path from "path";
import fs from "fs/promises";
import { logger } from "../providers/logger.provider";
import { StorageService } from "./storage.service";
import { CONFIG } from "@src/config/config";
import { MediaRepository } from "@src/repository/media.repository";
import { SyncService } from "./sync.service";
import { prisma } from "@src/providers/prisma";
import { syncEventInstance } from "@src/event/syncEvent";
/**
 * Servicio para generar la lista de reproducción (`playlist.json`) basada en campañas activas.
 * @class PlaylistService
 */
export abstract class PlaylistService {
  private static recoverySyncInFlight = false;
  private static lastRecoverySyncAt = 0;
  private static readonly RECOVERY_SYNC_COOLDOWN_MS = 10_000;

  /**
   * Dispara una sincronización de recuperación en background cuando faltan archivos físicos.
   * Incluye cooldown e indicador en memoria para evitar loops y llamadas concurrentes.
   */
  private static requestRecoverySyncIfNeeded(missingIds: string[]): void {
    if (missingIds.length === 0) return;

    if (this.recoverySyncInFlight) {
      logger.info("Recovery sync already in progress. Skipping new request.");
      return;
    }

    const now = Date.now();
    if (now - this.lastRecoverySyncAt < this.RECOVERY_SYNC_COOLDOWN_MS) {
      logger.info("Recovery sync skipped due to cooldown.");
      return;
    }

    this.lastRecoverySyncAt = now;
    this.recoverySyncInFlight = true;

    void (async () => {
      try {
        const syncState = await prisma.syncState.findUnique({ where: { id: 1 } });
        if (syncState?.syncing) {
          logger.info("Recovery sync skipped because another sync is already in progress.");
          return;
        }

        logger.warn({
          message: "Missing physical media detected during playlist generation. Requesting recovery sync.",
          missingCount: missingIds.length,
        });
        const syncResult = await SyncService.syncData(missingIds);
        if (syncResult) {
          syncEventInstance.emit("dto:updated", true);
        }
      } catch (err: any) {
        logger.error({
          message: "Recovery sync request failed",
          error: err?.message ?? String(err),
        });
      } finally {
        this.recoverySyncInFlight = false;
      }
    })();
  }

  /**
   * Punto unico para solicitar sync de recuperación desde cualquier capa.
   */
  public static requestRecoverySync(missingIds: string[]): void {
    this.requestRecoverySyncIfNeeded(missingIds);
  }

  // Solo para tests: evita dependencia del estado estatico entre suites.
  public static _resetRecoverySyncStateForTests(): void {
    this.recoverySyncInFlight = false;
    this.lastRecoverySyncAt = 0;
  }

  private static normalizeMediaId(id: string): string {
    return id.trim().toLowerCase();
  }

  /**
   * Verifica en disco si existen los IDs de media requeridos (case-insensitive).
   */
  public static async getMissingMediaIdsOnDisk(
    mediaIds: Iterable<string>
  ): Promise<string[]> {
    const files = (await StorageService.listDirectory(CONFIG.MEDIA_PATH)) || [];
    const physicalIds = new Set(
      files
        .filter((filename) => filename !== "temp")
        .map((filename) => path.parse(filename).name.toLowerCase())
    );

    const missing: string[] = [];
    for (const mediaId of mediaIds) {
      const normalized = this.normalizeMediaId(mediaId);
      if (!physicalIds.has(normalized)) {
        missing.push(mediaId);
      }
    }

    return missing;
  }

  /**
   * Genera o limpia `playlist.json` según campañas activas en el DTO.
   * @param {ISnapshotDto} dto - DTO sincronizado con campañas y slots.
   * @returns {{am: any[], pm: any[]}} Estructura de playlist creada.
   */
  static async generate(dto: ISnapshotDto): Promise<IPlaylistData> {
    const now = new Date();
    const inSixHours = new Date(now.getTime() + (6 * 60 * 60 * 1000));
    const playlistPath = CONFIG.PLAYLIST_PATH;
    const activeCampaigns = dto.data.campaigns.filter((campaign) => {
      const start = new Date(campaign.start_at);
      const end = new Date(campaign.end_at);

      return start <= inSixHours && end >= now;
    });

    const place_holder = dto.data.place_holder ? { id: dto.data.place_holder.id, fileType: dto.data.place_holder.name.split(".").pop() || "unknown" } : null;
    const activeMediaIds = activeCampaigns.flatMap((campaign) => [
      ...campaign.slots.am.map((slot) => slot.id),
      ...campaign.slots.pm.map((slot) => slot.id),
    ]);

    const mediaItems = (slot: FileDto, campaign: Campaign) => ({
      id: slot.id,
      fileType: slot.name.split(".").pop() || "mp4",
      start_at: campaign.start_at,
      end_at: campaign.end_at,
      position: slot.position
    });

    const downloadedMedia = await MediaRepository.getFilesDownloaded();
    const mediaIds = new Set<string>();
    const missingPhysicalMediaIds: string[] = [];
    const requiredByNormalized = new Map<string, string>();

    for (const mediaId of activeMediaIds) {
      const normalized = this.normalizeMediaId(mediaId);
      if (!requiredByNormalized.has(normalized)) {
        requiredByNormalized.set(normalized, mediaId);
      }
    }

    if (place_holder?.id) {
      const normalizedPlaceholderId = this.normalizeMediaId(place_holder.id);
      if (!requiredByNormalized.has(normalizedPlaceholderId)) {
        requiredByNormalized.set(normalizedPlaceholderId, place_holder.id);
      }
    }

    const downloadedByNormalized = new Map(
      downloadedMedia.map((media) => [this.normalizeMediaId(media.id), media])
    );

    for (const [normalizedId, originalId] of requiredByNormalized) {
      const media = downloadedByNormalized.get(normalizedId);
      if (!media?.localPath) {
        missingPhysicalMediaIds.push(originalId);
        continue;
      }

      const existsOnDisk = await Bun.file(media.localPath).exists();
      if (existsOnDisk) {
        mediaIds.add(normalizedId);
      } else {
        missingPhysicalMediaIds.push(originalId);
      }
    }

    this.requestRecoverySync(missingPhysicalMediaIds);

    const place_holder_downloaded = place_holder
      ? mediaIds.has(this.normalizeMediaId(place_holder.id))
      : false;

    if (place_holder && !place_holder_downloaded) {
      activeMediaIds.push(place_holder.id);
    }

    const campaigns = activeCampaigns.map((campaign) => {
      const am = campaign.slots.am
        .map((slot) => mediaItems(slot, campaign))
        .filter((item) => mediaIds.has(this.normalizeMediaId(item.id)));
      const pm = campaign.slots.pm
        .map((slot) => mediaItems(slot, campaign))
        .filter((item) => mediaIds.has(this.normalizeMediaId(item.id)));

      return {
        id: campaign.id,
        am,
        pm,
      };
    });

    const hasContent = campaigns.some((c) => c.am.length > 0 || c.pm.length > 0);

    if (!hasContent) {
      if (!(await StorageService.pathExists(playlistPath))) {
        await fs.mkdir(playlistPath);
      }

      const jsonContent: IPlaylistData = { campaigns: [], place_holder: place_holder_downloaded ? place_holder : null };

      await Bun.write(
        path.join(playlistPath, "playlist.json"),
        JSON.stringify(jsonContent, null, 2)
      );
      logger.info("Playlist cleared (no active campaigns).");

      logger.info(
        "Skipping orphan media cleanup because there are no active campaigns."
      );

      logger.warn("No media available for the current playlist.");
      return jsonContent;
    }
    if (!(await StorageService.pathExists(playlistPath))) {
      await fs.mkdir(playlistPath);
    }

    const jsonContent: IPlaylistData = { campaigns, place_holder: place_holder_downloaded ? place_holder : null };

    await Bun.write(
      path.join(playlistPath, "playlist.json"),
      JSON.stringify(jsonContent, null, 2)
    );
    await StorageService.removeOrphanMedia(activeMediaIds);
    logger.info("Playlist generated successfully.");
    return jsonContent;
  }
}

