import { ISnapshotDto } from "../../types/dto.type";
import { fetchDto } from "../providers/fetchDto";
import { prisma } from "../providers/prisma";

export abstract class SyncService {
  static async isNewVersion(inComingVersion: string) {
    const current = await prisma.playlistData.findUnique({
      where: { id: 1 },
    });
    return !current || current.version !== inComingVersion;
  }
  static async syncData() {
    const dto = await fetchDto<ISnapshotDto>(Bun.env.CMS_ROUTE_SNAPSHOT);

    if (!dto) {
      throw new Error("Failed to fetch DTO");
    }

    return dto;
  }
}
