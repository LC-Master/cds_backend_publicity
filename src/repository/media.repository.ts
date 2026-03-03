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
  /**
 * @returns Lista de archivos de media que tienen errores de descarga y no han superado el límite de reintentos.
 */
  public static async getFilesWithError(): Promise<IFile[]> {
    return await prisma.$extends({
      result: {
        media: {
          errorType: {
            needs: { status: true },
            compute(media) {
              return media.status === mediaStatusEnum.ERROR ? "Download Error" : "Unknown";
            }
          },
          lastErrorAt: {
            needs: { updatedAt: true, status: true },
            compute(media) {
              return media.status === mediaStatusEnum.ERROR ? new Date(media.updatedAt) : null;
            }
          },
          name: {
            needs: {
              filename: true
            },
            compute(media) {
              return media.filename;
            }
          }
        }
      }
    }).media.findMany({
      where: {
        isDownloaded: false,
        errorCount: { gte: 5 },
      },
      select: { id: true, checksum: true, name: true, errorCount: true, errorType: true, lastErrorAt: true },
    });
  }
  /**
   * @returns  Lista de archivos de media que están marcados como descargados en la base de datos.
   */
  public static async getFilesDownloaded() {
    return await prisma.media.findMany({
      where: {
        isDownloaded: true,
      },
      select: { id: true },
    });
  }
  /**
   * @returns Devuelve el conteo total de archivos de media en la base de datos.
   */
  public static async getCount() {
    return await prisma.media.count()
  }
}
