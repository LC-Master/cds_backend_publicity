/**
 * @module Storage Service
 * @description
 * Servicio de almacenamiento: manejo de carpeta temporal, descarga/verificación de archivos,
 * movimientos, limpieza de huérfanos y utilidades de disco.
 * Comentarios en español, sin tocar la lógica.
 */
import fs from "fs/promises";
import path from "path";
import { prisma } from "../providers/prisma";
import { IFile, IMediaFile } from "../../types/file.type";
import { mediaStatusEnum } from "../enums/mediaStatus.enum";
import { MediaRepository } from "../repository/media.repository";
import fileStreamProvider from "../providers/fileStream.provider";
import { logger } from "../providers/logger.provider";
import { CONFIG } from "@src/config/config";

/**
 * Funciones utilitarias para gestión de archivos y disco.
 * @class StorageService
 */
export abstract class StorageService {
  static checkPhysicalFiles(): any {
    throw new Error("Method not implemented.");
  }
  /**
   *@description
   * Reconciliar la integridad entre la base de datos y el sistema de archivos.
   * Elimina registros de media en la base de datos si el archivo correspondiente no existe en disco
   * @name reconcileMediaIntegrity
   * @static
   * @return {void}
   */
  public static async reconcileMediaIntegrity(): Promise<void> {
    try {
      const allDownloadedMedia = await prisma.media.findMany({
        where: { isDownloaded: true },
        select: { id: true, filename: true },
      });

      if (allDownloadedMedia.length === 0) return;

      const listMediaFile = (await this.listDirectory(CONFIG.MEDIA_PATH)) || [];

      const idsToDelete = allDownloadedMedia
        .filter((media) => {
          const expectedFileName = `${media.id}${path.extname(media.filename)}`;
          return !listMediaFile.includes(expectedFileName);
        })
        .map((media) => media.id);

      if (idsToDelete.length > 0) {
        await prisma.media.deleteMany({
          where: { id: { in: idsToDelete } },
        });

        logger.info(
          `Reconciled media: ${idsToDelete.length} records removed (missing on disk).`
        );
      } else {
        logger.info("Media integrity check passed: DB and Disk are in sync.");
      }
    } catch (err) {
      logger.error(`Error reconciling media integrity: ${err}`);
    }
  }
  /**
   * Verifica si un directorio existe y si está vacío.
   * @param {string} dirPath - Ruta del directorio a verificar.
   * @returns {Promise<string[] | undefined>} Lista de archivos o undefined si está vacío.
   */
  public static async listDirectory(
    dirPath: string
  ): Promise<string[] | undefined> {
    try {
      const exist = await this.pathExists(dirPath);
      if (!exist) {
        await fs.mkdir(dirPath, { recursive: true });
      }
      const files = await fs.readdir(dirPath);

      if (files.length === 0) {
        logger.info(`Directory is empty: ${dirPath}`);
        return undefined;
      }

      return files;
    } catch (err) {
      logger.error(`Error verifying directory ${dirPath}: ${err}`);
      return undefined;
    }
  }
  /**
   * Limpia la carpeta temporal `Media/temp`. Crea la carpeta si no existe.
   */
  public static async cleanTempFolder() {
    const tempPath = path.join(CONFIG.MEDIA_PATH, "temp");

    if (!(await this.pathExists(tempPath))) {
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
  /**
   * Mueve un archivo del directorio temporal al destino final, con manejo de EXDEV.
   * @param {string} src - Ruta del archivo origen.
   * @param {string} dest - Ruta de destino.
   */
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
  /**
   * Verifica el checksum del archivo stage antes de moverlo.
   * @param {IFile} file - Metadatos del archivo esperado.
   * @param {string} stagePath - Ruta del archivo temporal descargado.
   * @returns {Promise<boolean>} True si el checksum coincide.
   */
  private static async verifyChecksum(
    file: IFile,
    stagePath: string
  ): Promise<boolean> {
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
  /**
   * Generador que divide un arreglo en chunks del tamaño indicado.
   * @generator
   */
  private static *getChunks<T>(arr: T[], size: number): Generator<T[]> {
    for (let i = 0; i < arr.length; i += size) {
      yield arr.slice(i, i + size);
    }
  }
  /**
   * Procesa la descarga de un solo archivo: descarga, verifica checksum y mueve al destino final.
   * @param {IFile} file - Metadatos del archivo a procesar.
   * @returns {Promise<IMediaFile>} Resultado con estado y ruta local si aplica.
   */
  private static async processFile(file: IFile): Promise<IMediaFile> {
    const name = file.id + path.extname(file.name);
    const stagePath = path.join(CONFIG.MEDIA_PATH, "temp", name);
    const localPath = path.join(CONFIG.MEDIA_PATH, name);
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
  /**
   * Descarga y verifica en paralelo (por chunks) una lista de archivos.
   * @param {IFile[]} files - Archivos a descargar y verificar.
   * @returns {Promise<IMediaFile[]>} Resultados individuales por archivo.
   */
  public static async downloadAndVerifyFiles(
    files: IFile[]
  ): Promise<IMediaFile[]> {
    const chunks = this.getChunks(files, CONFIG.DOWNLOAD_CONCURRENCY);
    let results: IMediaFile[] = [];
    for (const chunk of chunks) {
      const chunkResults = await Promise.all(
        chunk.map((file) => this.processFile(file))
      );
      results.push(...chunkResults);
    }
    return results;
  }
  /**
   * Comprueba si existe una ruta y si es un directorio.
   * @param {string} p - Ruta a verificar.
   * @returns {Promise<boolean>} True si existe y es directorio.
   */
  public static async pathExists(p: string): Promise<boolean> {
    try {
      await fs.access(p);
      const stats = await fs.stat(p);
      return stats.isDirectory();
    } catch {
      return false;
    }
  }
  /**
   * @description Reintenta descargas que antes fallaron y actualiza el estado en DB.
   * @name retryFailedDownloads
   * @static
   * @return {void}
   */
  public static async retryFailedDownloads(): Promise<void> {
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
  /**
   * @description Elimina archivos y registros de media que ya no son activos (huérfanos).
   * @param {string[]} activeMediaIds - IDs activos que deben mantenerse.
   * @name removeOrphanMedia
   * @returns {Promise<void>}
   */
  public static async removeOrphanMedia(
    activeMediaIds: string[]
  ): Promise<void> {
    try {
      if (!activeMediaIds || activeMediaIds.length === 0) {
        logger.info(
          "No active media IDs provided; skipping orphan media cleanup."
        );
        return;
      }

      const orphanMedia = await prisma.media.findMany({
        where: { isDownloaded: true, id: { notIn: activeMediaIds } },
        select: { id: true, localPath: true },
      });

      if (orphanMedia.length === 0) return;

      orphanMedia.forEach(async (media) => {
        try {
          if (await Bun.file(media.localPath).exists()) {
            await Bun.file(media.localPath).delete();
          }
        } catch (err) {
          logger.error(`Error deleting file for media ${media.id}: ${err}`);
        }
      });

      await prisma.media.deleteMany({
        where: { id: { in: orphanMedia.map((m) => m.id) } },
      });

      logger.info(`Deleted ${orphanMedia.length} orphan media files.`);
    } catch (err) {
      logger.error(`Error removing orphan media: ${err}`);
    }
  }
  /**
   * @description Crea el directorio `logs` si no existe.
   * @name createLogDirIfNotExists
   * @static
   */
  public static createLogDirIfNotExists = async () => {
    try {
      if (!(await this.pathExists(CONFIG.LOGS_PATH))) {
        logger.info("Log directory does not exist. Creating...");
        await fs.mkdir(CONFIG.LOGS_PATH);
      } else {
        logger.info("Log directory already exists.");
      }
    } catch (err) {
      logger.error(`Error creating log directory: ${err}`);
    }
  };
  /**
   * @description Obtiene información del disco: espacio libre, usado y total.
   * @name getDiskInfo
   * @static
   */
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
  

  public static async clearFilesPath(filePath: string) {
    if (!(await this.pathExists(filePath))) {
      logger.warn(`Path does not exist: ${filePath}`);
      return;
    }
    try {
      const entries = await fs.readdir(filePath, { withFileTypes: true });
      entries.forEach(async (entry) => {
        const entryPath = path.join(filePath, entry.name);
        try {
          if (entry.isFile() || entry.isSymbolicLink()) {
            await fs.unlink(entryPath);
            logger.info(`Deleted file: ${entryPath}`);
          } else {
            logger.info(`Skipping directory: ${entryPath}`);
          }
        } catch (err) {
          logger.error(`Error deleting ${entryPath}: ${err}`);
        }
      });
      logger.info(`Successfully cleared files at path: ${filePath}`);
    } catch (err) {
      logger.error(`Error reading path ${filePath}: ${err}`);
    }
  }
}
