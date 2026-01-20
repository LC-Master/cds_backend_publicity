/**
 * @module PlaylistData Repository
 * @description
 * Repositorio para almacenar la versión y el JSON crudo del DTO (playlistData).
 */
import { ISnapshotDto } from "../../types/dto.type";
import { prisma } from "../providers/prisma";

export abstract class PlaylistDataRepository {
  /**
   * Guarda o actualiza la versión y el JSON del DTO en la tabla playlistData.
   * @param {ISnapshotDto} dto - DTO sincronizado completo.
   */
  static async saveVersion(dto: ISnapshotDto) {
    const result = await prisma.playlistData.upsert({
      update: {
        version: dto.meta.version,
        rawJson: JSON.stringify(dto),
      },
      create: {
        id: 1,
        rawJson: JSON.stringify(dto),
        version: dto.meta.version,
      },
      where: { id: 1 },
    });
    return result;
  }
}