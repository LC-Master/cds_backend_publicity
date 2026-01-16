import fs from "fs/promises";
import path from "path";
import { prisma } from "../providers/prisma";
import { IFile, IMediaFile } from "../../types/file.type";
import { mediaStatusEnum } from "../enums/mediaStatus.enum";
import { MediaRepository } from "../repository/media.repository";
import fileStreamProvider from "../providers/fileStream.provider";
import { logger } from "../providers/logger.provider";
import { ca } from "zod/v4/locales";
export abstract class StorageService {
  public static async cleanTempFolder() {
    const tempPath = path.join(process.cwd(), "Media", "temp");

    if (!(await Bun.file(tempPath).exists())) {
      await fs.mkdir(tempPath, { recursive: true });
      logger.info("Temp folder created.");
      return;
    }
    try {
      const files = await fs.readdir(tempPath);
      for (const file of files) {
        const filePath = path.join(tempPath, file);
        await Bun.file(filePath).delete();
      }
      logger.info("Temp folder cleaned successfully.");
    } catch (err) {
      logger.error(`Error cleaning temp folder: ${err}`);
    }
  }
  public static async filesExist(files: IFile[]) {
    const existingFiles = await prisma.media.findMany({
      where: {
        OR: files.map((file) => ({
          id: file.id,
          checksum: file.checksum,
          isDownloaded: true,
        })),
      },
      select: { id: true },
    });

    const existingFileIds = new Set(existingFiles.map((file) => file.id));

    return files.filter((file) => !existingFileIds.has(file.id));
  }
  private static async moveFile(src: string, dest: string) {
    try {
      await fs.rename(src, dest);
    } catch (err: any) {
      if (err.code === "EXDEV") {
        await Bun.write(dest, await Bun.file(src).arrayBuffer());
        await Bun.file(src).delete();
      } else {
        throw err;
      }
    }
  }
  private static async verifyChecksum(file: IFile, stagePath: string) {
    const bunFile = Bun.file(stagePath);
    const arrayBuffer = await bunFile.arrayBuffer();
    const computedChecksum = Bun.MD5.hash(arrayBuffer, "hex");
    const isValid = computedChecksum === file.checksum;
    if (!isValid) {
      logger.warn("Checksum mismatch for file:" + file.id);
      await bunFile.delete();
    }
    return isValid;
  }
  private static *getChunks<T>(arr: T[], size: number) {
    for (let i = 0; i < arr.length; i += size) {
      yield arr.slice(i, i + size);
    }
  }
  private static async processFile(file: IFile): Promise<IMediaFile> {
    const name = file.id + path.extname(file.name);
    const stagePath = path.join(process.cwd(), "Media", "temp", name);
    const localPath = path.join(process.cwd(), "Media", name);
    const mediaError: IMediaFile = {
      id: file.id,
      filename: file.name,
      status: mediaStatusEnum.ERROR,
      localPath: localPath,
      checksum: file.checksum,
      isDownloaded: false,
    };

    try {
      const res = await fileStreamProvider(file.id);
      await Bun.write(stagePath, res);
      const isValid = await this.verifyChecksum(file, stagePath);

      if (!isValid) return mediaError;

      await this.moveFile(stagePath, localPath);

      return {
        ...mediaError,
        status: mediaStatusEnum.DOWNLOADED,
        isDownloaded: true,
      };
    } catch (error) {
      logger.error(`Error processing file ID ${file.id}: ${error}`);
      return mediaError;
    }
  }

  public static async downloadAndVerifyFiles(files: IFile[]) {
    const chunks = this.getChunks(
      files,
      Number(Bun.env.DOWNLOAD_CONCURRENCY) || 5
    );
    let results: IMediaFile[] = [];
    for (const chunk of chunks) {
      const chunkResults = await Promise.all(
        chunk.map((file) => this.processFile(file))
      );
      results.push(...chunkResults);
    }
    return results;
  }
  public static async pathExists(p: string): Promise<boolean> {
    try {
      await fs.access(p);
      const stats = await fs.stat(p);
      return stats.isDirectory();
    } catch {
      return false;
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

      logger.info(`Retrying ${failedMedia.length} failed downloads.`);

      const toDownload: IFile[] = failedMedia.map((m) => ({
        id: m.id,
        name: m.filename,
        checksum: m.checksum,
      }));

      const results = await this.downloadAndVerifyFiles(toDownload);
      await MediaRepository.saveMany(results);
    } catch (err) {
      logger.error(`Error retrying failed downloads: ${err}`);
    }
  }
  static createLogDirIfNotExists = async () => {
    const logDir = path.join(process.cwd(), "logs");
    try {
      if (!(await this.pathExists(logDir))) {
        logger.info("Log directory does not exist. Creating...");
        await fs.mkdir(logDir);
      } else {
        logger.info("Log directory already exists.");
      }
    } catch (err) {
      logger.error(`Error creating log directory: ${err}`);
    }
  };
  public static getDiskInfo() {
    try {
      if (process.platform === "win32") {
        const driveLetter = path.parse(process.cwd()).root.replace("\\", "");
        const output = Bun.spawnSync([
          "wmic",
          "logicaldisk",
          "where",
          `DeviceID='${driveLetter}'`,
          "get",
          "Size,FreeSpace",
          "/format:csv",
        ]);
        const result = new TextDecoder()
          .decode(output.stdout)
          .trim()
          .split("\n")[1]
          .split(",");
        const free = parseInt(result[1], 10);
        const size = parseInt(result[2], 10);
        const used = size - free;
        return { free, size, used };
      } else {
        const output = Bun.spawnSync(["df", "-k", process.cwd()]);
        const result = new TextDecoder()
          .decode(output.stdout)
          .trim()
          .split("\n")[1]
          .split(/\s+/);
        const size = parseInt(result[1], 10) * 1024;
        const free = parseInt(result[3], 10) * 1024;
        const used = size - free;
        return { free, size, used };
      }
    } catch (err) {
      if (err instanceof Error) {
        logger.error(`Error getting disk info: ${err.message}`);
      }
      return { free: 0, size: 0, used: 0 };
    }
  }
}
