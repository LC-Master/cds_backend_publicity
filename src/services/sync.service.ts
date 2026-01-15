import path from "path";
import { ISnapshotDto } from "../../types/dto.type";
import { IFile, IMediaFile } from "../../types/file.type";
import { fetchDto } from "../providers/fetchDto";
import fileStreamProvider from "../providers/fileStream.provider";
import { prisma } from "../providers/prisma";
import fs from "fs/promises";
export abstract class SyncService {
  static async isNewVersion(inComingVersion: string) {
    const current = await prisma.playlistData.findUnique({
      where: { id: 1 },
    });
    return !current || current.version !== inComingVersion;
  }
  private static async syncFiles(files: IFile[]) {
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

  private static async downloadAndRegistreFiles(files: IFile[]) {
    const chunks = this.getChunks(files, 10);
    for (const chunk of chunks) {
      const downloadPromises = chunk.map(async (file) => {
        const res = await fileStreamProvider(file.id);
        const name = file.id + path.extname(file.name);
        const stagePath = path.join(process.cwd(), "Media", "temp", name);
        const localPath = path.join(process.cwd(), "Media", name);
        await Bun.write(stagePath, res);
        const isValid = await this.verifyChecksum(file, stagePath);

        if (!isValid) return null;

        await this.moveFile(stagePath, localPath);

        return {
          id: file.id,
          filename: file.name,
          localPath: localPath,
          updatedAt: new Date().toISOString(),
          checksum: file.checksum,
          isDownloaded: true,
        };
      });
      const files = await Promise.all(downloadPromises);
      console.log("Downloaded files:", files);

      //   await MediaRepository.saveMany(
      //     files.filter((file): file is IMediaFile => file !== null)
      //   );
    }
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

    await this.syncFiles(mediaList);
    await this.downloadAndRegistreFiles(mediaList);
    PlaylistDataRepository.saveVersion(dto);

    return [dto, isNew];
  }
}
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
export abstract class MediaRepository {
  static async save(file: IMediaFile) {
    const result = await prisma.media.create({
      data: file,
    });
    return result;
  }
  static async saveMany(files: IMediaFile[]) {
    const result = await prisma.media.createMany({
      data: files,
    });
    return result;
  }
}
