/**
 * @module Token Repository
 * @description
 * Repositorio para acceder y persistir el `ApiKeY` en la base de datos.
 */
import { prisma } from "../providers/prisma";

export abstract class TokenRepository {
  /**
   * Obtiene el hash de la API key desde la DB (si existe).
   * @returns {Promise<string|null>} Hash almacenado o null.
   */
  public static async get() {
    const token = await prisma.apiKeY.findUnique({ where: { id: 1 } });
    return token?.key || null;
  }
  /**
   * Comprueba si existe una API key almacenada en DB.
   * @returns {Promise<boolean>} True si existe.
   */
  public static async exists() {
    const token = await prisma.apiKeY.findUnique({ where: { id: 1 } });
    return !!token;
  }
  /**
   * Guarda o actualiza el hash de la API key.
   * @param {string} hashedToken - Hash a persistir.
   * @returns {{ key: string }} Objeto con la clave guardada.
   */
  public static async save(hashedToken: string) {
    const result = await prisma.apiKeY.upsert({
      where: { id: 1 },
      create: { key: hashedToken },
      update: { key: hashedToken },
    });
    return { key: result.key };
  }
}
