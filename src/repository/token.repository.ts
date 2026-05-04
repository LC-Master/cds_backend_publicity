/**
 * @module Token Repository
 * @description
 * Repositorio para acceder y persistir el `ApiKeY` en la base de datos.
 */
import { ca } from "zod/locales";
import { prisma } from "../providers/prisma";

export abstract class TokenRepository {
  /**
   * Obtiene el hash de la API key desde la DB (si existe).
   * @returns {Promise<string|null>} Hash almacenado o null.
   */
  public static async get() {
    const token = await prisma.apiKey.findUnique({ where: { id: 1 } });
    return token?.key || null;
  }
  /**
   * Comprueba si existe una API key almacenada en DB.
   * @returns {Promise<boolean>} True si existe.
   */
  public static async exists() {
    const token = await prisma.apiKey.findUnique({ where: { id: 1 } });
    return !!token;
  }
  /**
   * Guarda o actualiza el hash de la API key.
   * @param {string} hashedToken - Hash a persistir.
   * @returns {{ key: string }} Objeto con la clave guardada.
   */
  public static async save(hashedToken: string, expiresAt: Date | null = null): Promise<{ key: string }> {
    try {
      const result = await prisma.apiKey.upsert({
        where: { id: 1 },
        create: { key: hashedToken, expiresAt },
        update: { key: hashedToken, expiresAt },
      });
      return { key: result.key };
    } catch (err: any) {
      throw new Error(`Error saving API key to database: ${err.message}`);
    }
  }

  /**
   * Obtiene la fecha de expiración almacenada para la API key (si existe).
   * @returns {Promise<Date|null>} Fecha de expiración o null si no existe.
   */
  public static async getExpiry(): Promise<Date | null> {
    const token = await prisma.apiKey.findUnique({ where: { id: 1 } });
    return token?.expiresAt || null;
  }
}
