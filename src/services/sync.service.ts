import path from "path";
import { ISnapshotDto } from "../../types/dto.type";
import { IFile, IMediaFile } from "../../types/file.type";
import { fetchDto } from "../providers/fetchDto";
import fileStreamProvider from "../providers/fileStream.provider";
import { prisma } from "../providers/prisma";
import fs from "fs/promises";
import { mediaStatusEnum } from "../enums/mediaStatus.enum";
import { MediaRepository } from "../repository/media.repository";
import { PlaylistDataRepository } from "../repository/playlistData.repository";


export abstract class SyncService {
  static async isNewVersion(inComingVersion: string) {
    const current = await prisma.playlistData.findUnique({
      where: { id: 1 },
    });
    return !current || current.version !== inComingVersion;
  }
  public static async retryFailedDownloads() {}
  private static async filesExist(files: IFile[]) {
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
      console.warn("Checksum mismatch for file:", file.id);
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
      console.error(`Error processing file ID ${file.id}:`, error);
      return mediaError;
    }
  }

  public static async downloadAndVerifyFiles(files: IFile[]) {
    const chunks = this.getChunks(files, 10);
    let results: IMediaFile[] = [];
    for (const chunk of chunks) {
      const chunkResults = await Promise.all(
        chunk.map((file) => this.processFile(file))
      );
      results.push(...chunkResults);
    }
    return results;
  }

  static async syncData() {
    const dto = await fetchDto<ISnapshotDto>(Bun.env.CMS_ROUTE_SNAPSHOT);

    if (!dto) {
      throw new Error("Failed to fetch DTO");
    }

    const isNew = await this.isNewVersion(dto.meta.version);

    // if (!isNew) return [dto, isNew];

    const mediaList = dto.data.campaigns
      .map((campaign) => [...campaign.slots.am, ...campaign.slots.pm])
      .flat();

    const syncedFiles = await this.filesExist(mediaList);
    const files = await this.downloadAndVerifyFiles(syncedFiles);
    const savedFiles = await MediaRepository.saveMany(files);

    console.log(
      `Downloaded and saved ${savedFiles.length} new media files out of ${syncedFiles.length} attempted.`
    );

    PlaylistDataRepository.saveVersion(dto);

    return dto;
  }
}
