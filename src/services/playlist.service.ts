/**
 * @module Playlist Service
 * @description
 * Genera el archivo `playlist.json` a partir del DTO sincronizado y gestiona la limpieza de media huérfana.
 * Documentación en español; no se altera la lógica.
 */ import { ISnapshotDto } from "../../types/dto.type";
import { prisma } from "../providers/prisma";
import path from "path";
import fs from "fs/promises";
import { logger } from "../providers/logger.provider";
import { StorageService } from "./storage.service";
import { extractMediaList } from "@src/lib/campaignHelpers";
import { CONFIG } from "@src/config/config";
/**
 * Servicio para generar la lista de reproducción (`playlist.json`) basada en campañas activas.
 * @class PlaylistService
 */
export abstract class PlaylistService {
  /**
   * Genera o limpia `playlist.json` según campañas activas en el DTO.
   * @param {ISnapshotDto} dto - DTO sincronizado con campañas y slots.
   * @returns {{am: any[], pm: any[]}} Estructura de playlist creada.
   */
  static async generate(dto: ISnapshotDto): Promise<{ am: any[]; pm: any[] }> {
    const now = new Date();
    const playlistPath = CONFIG.PLAYLIST_PATH;
    const activeCampaigns = dto.data.campaigns.filter(
      (campaign) => campaign.start_at <= now && campaign.end_at >= now
    );

    const activeMediaIds = extractMediaList(dto).map((slot) => slot.id);

    const amPlaylist = activeCampaigns.flatMap((campaign) =>
      campaign.slots.am.map((slot) => ({
        id: slot.id,
        name: slot.name.split(".").pop() || "mp4",
        start_at: campaign.start_at,
        end_at: campaign.end_at,
      }))
    );
    const pmPlaylist = activeCampaigns.flatMap((campaign) =>
      campaign.slots.pm.map((slot) => ({
        id: slot.id,
        fileType: slot.name.split(".").pop() || "mp4",
        start_at: campaign.start_at,
        end_at: campaign.end_at,
      }))
    );

    const media = await prisma.media.findMany({
      where: { isDownloaded: true },
      select: { id: true },
    });
    const mediaIds = new Set(media.map((m) => m.id));

    const filteredAm = amPlaylist.filter((item) => mediaIds.has(item.id));
    const filteredPm = pmPlaylist.filter((item) => mediaIds.has(item.id));

    if (filteredAm.length === 0 && filteredPm.length === 0) {
      if (!(await StorageService.pathExists(playlistPath))) {
        await fs.mkdir(playlistPath);
      }

      await Bun.write(
        path.join(playlistPath, "playlist.json"),
        JSON.stringify({ am: [], pm: [] }, null, 2)
      );
      logger.info("Playlist cleared (no active campaigns).");

      logger.info(
        "Skipping orphan media cleanup because there are no active campaigns."
      );

      logger.warn("No media available for the current playlist.");
      return { am: [], pm: [] };
    }
    if (!(await StorageService.pathExists(playlistPath))) {
      await fs.mkdir(playlistPath);
    }

    await Bun.write(
      path.join(playlistPath, "playlist.json"),
      JSON.stringify({ am: filteredAm, pm: filteredPm }, null, 2)
    );
    await StorageService.removeOrphanMedia(activeMediaIds);
    logger.info("Playlist generated successfully.");
    return { am: filteredAm, pm: filteredPm };
  }
}
