import { CONFIG } from "@src/config/config";
import { extractMediaList } from "@src/lib/campaignHelpers";
import { prisma } from "@src/providers/prisma";
import { ISnapshotDto } from "../../types/dto.type";
import { IFile } from "../../types/file.type";
import { StorageService } from "./storage.service";
import { logger } from "@src/providers/logger.provider";

export abstract class MediaService {
  /**
   * @description Verifica la integridad física de los archivos de media en el sistema de archivos.
   * @param dto DTO que contiene la lista de media esperada.
   * @returns Lista de IDs de archivos faltantes en el sistema de archivos.
   */
  public static async checkPhysicalMedia(dto: ISnapshotDto) {
    let files = await StorageService.listDirectory(CONFIG.MEDIA_PATH);
    const mediaList = extractMediaList(dto);

    const mediaListIds = mediaList.map((media) => media.id);

    files = files
      ? files
          .filter((filename) => "temp" !== filename)
          .map((filename) => filename.split(".")[0])
      : [];

    const missingFiles = mediaListIds.filter((id) => !files.includes(id));
    logger.info({ missingFiles });
    return missingFiles;
  }
  /**
   *
   * @param files  Lista de archivos a verificar.
   * @param forcedMissingIds  Lista de IDs que deben considerarse como faltantes, forzando su descarga.
   * @returns  Lista de archivos que no están marcados como descargados en la base de datos o forzados como faltantes.
   */
  public static async getMissingFiles(
    files: IFile[],
    forcedMissingIds: string[] = []
  ): Promise<IFile[]> {
    const existingFiles = await prisma.media.findMany({
      where: {
        id: { in: files.map((f) => f.id) },
        isDownloaded: true,
        checksum: { in: files.map((f) => f.checksum) },
        NOT:
          forcedMissingIds.length > 0
            ? { id: { in: forcedMissingIds } }
            : undefined,
      },
      select: { id: true },
    });
    const existingFileIds = new Set(existingFiles.map((file) => file.id));

    return files.filter((file) => !existingFileIds.has(file.id));
  }
}
