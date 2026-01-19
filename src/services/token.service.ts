import z from "zod";
import { jwt } from "../../types/jwt.type";
import { TokenRepository } from "@src/repository/token.repository";
import path from "path";
import { logger } from "@src/providers/logger.provider";

export default abstract class TokenService {
  private static readonly pathFileToken = path.join(
    process.cwd(),
    "token_api.txt"
  );
  private static async generateToken(jwt: jwt) {
    return await jwt.sign({ userId: "123", isAdmin: true });
  }
  private static async validateToken(token: string) {
    const validation = z.jwt().safeParse(token);

    if (!validation.success) throw new Error("Invalid token generated");

    return validation.data;
  }
  private static async hashToken(token: string) {
    const hashedToken = await Bun.password.hash(token, {
      algorithm: "bcrypt",
      cost: 12,
    });

    if (!hashedToken) throw new Error("Error hashing token");

    return hashedToken;
  }
  public static async createApiKey(jwt: jwt) {
    try {
      const token = await this.generateToken(jwt);
      const validatedToken = await this.validateToken(token);
      const hashedToken = await this.hashToken(validatedToken);
      const savedToken = await TokenRepository.save(hashedToken);

      if (!savedToken || !savedToken.key) {
        throw new Error("Error saving API key to database");
      }
      await this.createFileToken(savedToken.key);
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
