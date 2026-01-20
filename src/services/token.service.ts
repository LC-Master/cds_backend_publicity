import { jwt } from "../../types/jwt.type";
import { TokenRepository } from "@src/repository/token.repository";
import path from "path";
import { logger } from "@src/providers/logger.provider";
import { jwtSchema } from "@src/schemas/jwt.schema";

export default abstract class TokenService {
  private static readonly pathFileToken = path.join(
    process.cwd(),
    "token_api.txt"
  );
  private static async generateToken(jwt: jwt) {
    return await jwt.sign({ server: "api" });
  }
  public static async validateToken(token: string) {
    const validation = jwtSchema.safeParse(token);

    if (!validation.success) return null;

    return validation.data;
  }
  private static async hashToken(token: string) {
    const hashedToken = await Bun.password.hash(token, {
      algorithm: "argon2id",
      memoryCost: 65536,
      timeCost: 3,
    });

    if (!hashedToken) throw new Error("Error hashing token");

    return hashedToken;
  }
  public static async createApiKey(jwt: jwt) {
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
  private static async createFileToken(token: string) {
    await Bun.write(this.pathFileToken, token);
  }
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
