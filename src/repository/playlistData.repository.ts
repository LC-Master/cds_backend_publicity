import { ISnapshotDto } from "../../types/dto.type";
import { prisma } from "../providers/prisma";

export abstract class PlaylistDataRepository {
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