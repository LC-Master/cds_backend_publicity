/**
 * @module Media Repository
 * @description
 * Repositorio para persistir y actualizar registros de media en la base de datos.
 */
import { IFile, IMediaFile } from "../../types/file.type";
import { mediaStatusEnum } from "../enums/mediaStatus.enum";
import { prisma } from "../providers/prisma";

export abstract class MediaRepository {
  /**
   * Filtra la lista de archivos devolviendo únicamente los que NO están marcados como descargados en DB.
   * @param {IFile[]} files - Archivos del DTO para verificar.
   * @returns {Promise<IFile[]>} Archivos que necesitan ser descargados.
   */
  public static async getMissingFiles(files: IFile[]): Promise<IFile[]> {
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
  /**
   * Guarda un registro de media en la DB.
   * @param {IMediaFile} file - Datos del archivo a persistir.
   */
  static async save(file: IMediaFile) {
    const result = await prisma.media.create({
      data: file,
    });
    return result;
  }
  /**
   * Inserta o actualiza múltiples registros de media en una transacción.
   * @param {IMediaFile[]} files - Array de resultados de descarga para persistir.
   */
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
