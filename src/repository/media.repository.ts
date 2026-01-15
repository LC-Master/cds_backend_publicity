import { IMediaFile } from "../../types/file.type";
import { mediaStatusEnum } from "../enums/mediaStatus.enum";
import { prisma } from "../providers/prisma";

export abstract class MediaRepository {
  static async save(file: IMediaFile) {
    const result = await prisma.media.create({
      data: file,
    });
    return result;
  }
  static async saveMany(files: IMediaFile[]) {
    const transaction = files.map((file) => {
      return prisma.media.upsert({
        where: { id: file.id },
        create: {
          ...file,
          updatedAt: new Date().toISOString(),
          errorCount: file.status === mediaStatusEnum.ERROR ? 1 : 0,
        },
        update: {
          ...file,
          updatedAt: new Date().toISOString(),
          errorCount:
            file.status === mediaStatusEnum.ERROR ? { increment: 1 } : 0,
        },
      });
    });
    return await prisma.$transaction(transaction);
  }
}
