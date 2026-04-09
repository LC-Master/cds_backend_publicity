/**
 * @module Servicio de Tokens
 * @description
 * Servicio para generar, validar y gestionar la API key (token) usada por el servicio.
 * Los métodos gestionan la creación, hashing y persistencia segura del token en la base de datos,
 * y la creación de un archivo temporal `token_api.txt` con el token crudo (solo al crear).
 * Todos los comentarios están en español y **no** se modifica la lógica.
 */
import { jwt } from "../../types/jwt.type";
import { TokenRepository } from "@src/repository/token.repository";
import path from "path";
import { logger } from "@src/providers/logger.provider";
import { jwtSchema } from "@src/schemas/jwt.schema";

/**
 * Servicio estático para manejo de API Keys.
 * @class TokenService
 */
export default abstract class TokenService {
  public static tokenRaw: string | null = null;
  private static readonly pathFileToken = path.join(
    process.cwd(),
    "token_api.txt"
  );
  private static cachedHash: string | null = null;
  private static lastHashLoad = 0;
  private static readonly HASH_TTL_MS = 60_000;
  private static readonly TOKEN_CACHE_TTL_MS = 5 * 60_000;
  private static readonly TOKEN_CACHE_MAX_ENTRIES = 2_000;
  private static tokenCache = new Map<string, number>();

  private static pruneTokenCache(now = Date.now()): void {
    for (const [token, validUntil] of this.tokenCache.entries()) {
      if (validUntil <= now) {
        this.tokenCache.delete(token);
      }
    }

    if (this.tokenCache.size <= this.TOKEN_CACHE_MAX_ENTRIES) {
      return;
    }

    const entriesByExpiry = [...this.tokenCache.entries()].sort(
      (a, b) => a[1] - b[1]
    );
    const toDelete = this.tokenCache.size - this.TOKEN_CACHE_MAX_ENTRIES;
    for (let i = 0; i < toDelete; i++) {
      this.tokenCache.delete(entriesByExpiry[i][0]);
    }
  }
  /**
   * Genera un token JWT utilizando el helper `jwt`.
   * @param {jwt} jwt - Instancia del helper JWT configurada en el servidor.
   * @returns {Promise<string>} Token firmado.
   */
  private static async generateToken(jwt: jwt): Promise<string> {
    return await jwt.sign({ server: "api" });
  }
  /**
   * Valida la estructura del token usando el esquema zod.
   * @param {string} token - Token crudo a validar.
   * @returns {Promise<string|null>} El token validado o null si no es válido.
   */
  public static async validateToken(token: string): Promise<string | null> {
    const validation = jwtSchema.safeParse(token);

    if (!validation.success) return null;

    return validation.data;
  }

  private static async getHashedToken(): Promise<string | null> {
    const now = Date.now();
    if (this.cachedHash && now - this.lastHashLoad < this.HASH_TTL_MS) {
      return this.cachedHash;
    }
    const token = await TokenRepository.get();
    this.cachedHash = token;
    this.lastHashLoad = now;
    return token;
  }

  /**
   * Valida estructura, firma JWT y hash del bearer con cache en memoria para evitar recomputar Argon2 por petición.
   */
  public static async verifyBearer(rawToken: string, jwtInstance: jwt): Promise<boolean> {
    this.pruneTokenCache();

    const validatedRaw = await this.validateToken(rawToken);
    if (!validatedRaw) return false;

    try {
      const verified = await jwtInstance.verify(rawToken);
      if (!verified) return false;
    } catch {
      return false;
    }

    const cachedValidUntil = this.tokenCache.get(rawToken);
    if (cachedValidUntil && cachedValidUntil > Date.now()) {
      return true;
    }

    const hashed = await this.getHashedToken();
    if (!hashed) return false;

    const ok = await Bun.password.verify(validatedRaw, hashed);
    if (ok) {
      this.tokenCache.set(rawToken, Date.now() + this.TOKEN_CACHE_TTL_MS);
      this.pruneTokenCache();
    }
    return ok;
  }
  /**
   * @description Hashea un token usando Argon2id con parámetros de seguridad.
   * @param {string} token - Token crudo.
   * @returns {Promise<string>} Hash seguro del token.
   */
  private static async hashToken(token: string): Promise<string> {
    logger.info("Starting Argon2id hashing...");
    const hashedToken = await Bun.password.hash(token, {
      algorithm: "argon2id",
      memoryCost: 16384,
      timeCost: 2,
    });

    if (!hashedToken) throw new Error("Error hashing token");

    return hashedToken;
  }
  /**
   * Genera, valida, hashea y persiste una API key.
   * También escribe el token crudo en `token_api.txt` (solo una vez).
   * @param {jwt} jwt - Instancia JWT para firmar el token.
   * @description Crea una API key segura y la guarda en la base de datos.
   * @returns {Promise<void>}
   */
  public static async createApiKey(jwt: jwt): Promise<void> {
    try {
      const token = await this.generateToken(jwt);

      const validated = await this.validateToken(token);

      if (!validated) {
        throw new Error("Generated token is invalid");
      }
      this.tokenRaw = token;
      const hashedToken = await this.hashToken(validated);

      const savedToken = await TokenRepository.save(hashedToken);

      if (!savedToken || !savedToken.key) {
        throw new Error("Error saving API key to database");
      }
      logger.info("API key hashed and saved to database successfully.");
      // try {
      //   await this.createFileToken(validated);
      //   try {
      //     const fs = await import("fs/promises");
      //     await fs.chmod(this.pathFileToken, 0o600);
      //   } catch (chmodErr) {
      //     logger.warn(
      //       `Unable to set file permissions for API key file: ${chmodErr}`
      //     );
      //   }
      // } catch (fileErr) {
      //   logger.error(`Failed to write API key file: ${fileErr}`);
      // }

      // logger.info(
      //   "API key created and saved successfully. on path " + this.pathFileToken
      // );
    } catch (err: any) {
      throw new Error(`Error creating API key: ${err.message}`);
    }
  }
  /**
   * @param {string} token - Token crudo a escribir.
   * @description Crea un archivo temporal con el token crudo en disco llamado `token_api.txt`.
   * @returns {Promise<void>}
   */
  private static async createFileToken(token: string): Promise<void> {
    await Bun.write(this.pathFileToken, token);
  }
  /**
   * Verifica si existe una API key guardada en la DB.
   * @returns {Promise<boolean>} True si existe, false si no.
   */
  public static async tokenApiExists(): Promise<boolean> {
    try {
      logger.info("Checking if API key exists in database...");
      const exists = await TokenRepository.exists();

      if (!exists) {
        logger.warn("API key does not exist.");
        return false;
      }

      logger.info("API key exists.");
      return true;
    } catch (error: any) {
      logger.error({
        message: "CRITICAL: Database query failed in tokenApiExists",
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  }
}
