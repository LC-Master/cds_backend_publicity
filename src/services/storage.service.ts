import fs from "fs/promises";
import path from "path";
import { prisma } from "../providers/prisma";
import { IFile } from "../../types/file.type";
import { mediaStatusEnum } from "../enums/mediaStatus.enum";
import { MediaRepository } from "../repository/media.repository";
import { SyncService } from "./sync.service";

export abstract class StorageService {
  public static async cleanTempFolder() {
    const tempPath = path.join(process.cwd(), "Media", "temp");

    if (!(await Bun.file(tempPath).exists())) {
      await fs.mkdir(tempPath, { recursive: true });
      console.log("Temp folder created.");
      return;
    }

    try {
      const files = await fs.readdir(tempPath);
      for (const file of files) {
        const filePath = path.join(tempPath, file);
        await Bun.file(filePath).delete();
      }
      console.log("Temp folder cleaned successfully.");
    } catch (err) {
      console.error("Error cleaning temp folder:", err);
    }
  }
  public static async retryFailedDownloads() {
    try {
      const failedMedia = await prisma.media.findMany({
        where: {
          status: mediaStatusEnum.ERROR,
          errorCount: { lt: 5 },
        },
      });

      if (failedMedia.length === 0)
        throw new Error("No failed downloads to retry.");

      console.log(`[Retry] Reintentando ${failedMedia.length} archivos...`);

      const toDownload: IFile[] = failedMedia.map((m) => ({
        id: m.id,
        name: m.filename,
        checksum: m.checksum,
      }));

      const results = await SyncService.downloadAndVerifyFiles(toDownload);
      await MediaRepository.saveMany(results);
    } catch (err) {
      console.error("Error retrying failed downloads:", err);
    }
  }
}
