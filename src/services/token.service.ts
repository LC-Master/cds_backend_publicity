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
  private static readonly pathFileToken = path.join(
    process.cwd(),
    "token_api.txt"
  );
  /**
   * Genera un token JWT utilizando el helper `jwt`.
   * @param {jwt} jwt - Instancia del helper JWT configurada en el servidor.
   * @returns {Promise<string>} Token firmado.
   */
  private static async generateToken(jwt: jwt) {
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
  /**
   * @description Hashea un token usando Argon2id con parámetros de seguridad.
   * @param {string} token - Token crudo.
   * @returns {Promise<string>} Hash seguro del token.
   */
  private static async hashToken(token: string): Promise<string> {
    const hashedToken = await Bun.password.hash(token, {
      algorithm: "argon2id",
      memoryCost: 65536,
      timeCost: 3,
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

      if(!validated) {
        throw new Error("Generated token is invalid");
      }

      const hashedToken = await this.hashToken(validated);

      const savedToken = await TokenRepository.save(hashedToken);

      if (!savedToken || !savedToken.key) {
        throw new Error("Error saving API key to database");
      }

      try {
        await this.createFileToken(validated);
        try {
          const fs = await import("fs/promises");
          await fs.chmod(this.pathFileToken, 0o600);
        } catch (chmodErr) {
          logger.warn(
            `Unable to set file permissions for API key file: ${chmodErr}`
          );
        }
      } catch (fileErr) {
        logger.error(`Failed to write API key file: ${fileErr}`);
      }

      logger.info(
        "API key created and saved successfully. on path " + this.pathFileToken
      );
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
  public static async tokenApiExists() {
    logger.info("Checking if API key exists in database...");
    const exists = await TokenRepository.exists();
    if (!exists) {
      logger.warn("API key does not exist.");
      return false;
    }
    logger.info("API key exists.");
    return true;
  }
}
