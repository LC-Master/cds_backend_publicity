/**
 * @module Servicio de Tokens
 * @description
 * Servicio para generar, validar y gestionar la API key (token) usada por el servicio.
 * Los métodos gestionan la creación, hashing y persistencia segura del token en la base de datos,
 * y la creación de un archivo temporal `token_api.txt` con el token crudo (solo al crear).
 * Todos los comentarios están en español.
 */
import path from "path";
import { jwt } from "../../types/jwt.type";
import { TokenRepository } from "@src/repository/token.repository";
import { logger } from "@src/providers/logger.provider";
import { jwtSchema } from "@src/schemas/jwt.schema";

/**
 * Servicio estático para manejo de API Keys.
 * @class TokenService
 */
export default abstract class TokenService {
  public static tokenRaw: string | null = null;
  private static cachedHash: string | null = null;
  private static lastHashLoad = 0;
  private static readonly HASH_TTL_MS = 60_000;
  private static readonly TOKEN_CACHE_TTL_MS = 5 * 60_000;
  private static readonly TOKEN_CACHE_MAX_ENTRIES = 2_000;
  private static readonly ROTATE_COOLDOWN_MS = 30_000;
  private static tokenCache = new Map<string, number>();
  private static lastRotateAttempt = 0;

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

  private static extractExpFromJwt(token: string): number | null {
    try {
      const parts = token.split('.');
      if (parts.length < 2) return null;
      const b64 = parts[1];
      const pad = b64.length % 4;
      const base64 = b64.replace(/-/g, '+').replace(/_/g, '/') + (pad ? '='.repeat(4 - pad) : '');
      const json = Buffer.from(base64, 'base64').toString('utf8');
      const payload = JSON.parse(json);
      const exp = payload?.exp;
      if (typeof exp === 'number' && Number.isFinite(exp)) return exp;
      if (typeof exp === 'string') {
        const parsed = Number(exp);
        if (Number.isFinite(parsed)) return parsed;
      }
      return null;
    } catch {
      return null;
    }
  }

  private static isExpired(expiresAt: Date | null | undefined, now = Date.now()): boolean {
    if (!expiresAt) return false;
    return expiresAt.getTime() <= now;
  }

  public static async ensureApiKey(jwt: jwt): Promise<string> {
    const apiKey = await TokenRepository.getFull();
    const expiresAt = apiKey?.expiresAt ? new Date(apiKey.expiresAt) : null;
    const expired = !apiKey || this.isExpired(expiresAt);

    if (this.tokenRaw && !expired) {
      return this.tokenRaw;
    }

    if (!expired && apiKey && !this.tokenRaw) {
      logger.warn("API key exists but raw token is not in memory; rotating token to recover");
    } else if (expired) {
      logger.info("API key missing or expired; rotating token");
    }

    await this.createApiKey(jwt);
    if (!this.tokenRaw) {
      throw new Error("Token generation failed");
    }
    return this.tokenRaw;
  }

  /**
   * Valida estructura, firma JWT y hash del bearer con cache en memoria para evitar recomputar Argon2 por petición.
   */
  public static async verifyBearer(rawToken: string, jwtInstance: jwt): Promise<boolean> {
    this.pruneTokenCache();
    const now = Date.now();

    const validatedRaw = await this.validateToken(rawToken);
    if (!validatedRaw) return false;

    const exp = this.extractExpFromJwt(rawToken);
    const expMs = exp !== null ? exp * 1000 : null;
    try {
      const verified = await jwtInstance.verify(rawToken);
      if (!verified) return false;
    } catch {
      const rotated = await this.rotateIfStoredAndExpired(rawToken, validatedRaw, expMs, jwtInstance, now);
      if (rotated) {
        return false;
      }
      return false;
    }

    const cachedValidUntil = this.tokenCache.get(rawToken);
    if (cachedValidUntil && cachedValidUntil > now && (expMs === null || expMs > now)) {
      return true;
    }

    const hashed = await this.getHashedToken();
    if (!hashed) return false;

    const ok = await Bun.password.verify(validatedRaw, hashed);
    if (ok) {
      const cacheUntil = expMs !== null ? Math.min(now + this.TOKEN_CACHE_TTL_MS, expMs) : now + this.TOKEN_CACHE_TTL_MS;
      if (cacheUntil > now) {
        this.tokenCache.set(rawToken, cacheUntil);
      }
      this.pruneTokenCache();
    }
    return ok;
  }

  private static async rotateIfStoredAndExpired(
    rawToken: string,
    validatedRaw: string,
    expMs: number | null,
    jwtInstance: jwt,
    now = Date.now()
  ): Promise<boolean> {
    const hashed = await this.getHashedToken();
    if (!hashed) return false;

    const matchesStored = await Bun.password.verify(validatedRaw, hashed);
    if (!matchesStored) return false;

    const expired = expMs !== null && expMs <= now;
    if (!expired && expMs !== null) {
      logger.warn("JWT verification failed for stored token; rotating to recover");
    }

    if (now - this.lastRotateAttempt < this.ROTATE_COOLDOWN_MS) {
      return false;
    }

    this.lastRotateAttempt = now;
    try {
      await this.createApiKey(jwtInstance);
      return true;
    } catch (err: any) {
      logger.error({ message: "Token rotation failed", error: err?.message || err });
      return false;
    }
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
      const tokenFilePath = path.join(process.cwd(), "token_api.txt");
      const tokenFile = Bun.file(tokenFilePath);
      if (!await tokenFile.exists()) {
        await Bun.write(tokenFilePath, token);
      }
      const hashedToken = await this.hashToken(validated);

      const exp = this.extractExpFromJwt(token);
      const expiresAt = exp !== null ? new Date(exp * 1000) : null;

      const savedToken = await TokenRepository.save(hashedToken, expiresAt);

      if (!savedToken || !savedToken.key) {
        throw new Error("Error saving API key to database");
      }
      this.cachedHash = hashedToken;
      this.lastHashLoad = Date.now();
      this.tokenCache.clear();
      logger.info("API key hashed and saved to database successfully.");
    } catch (err: any) {
      throw new Error(`Error creating API key: ${err.message}`);
    }
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
