import { V4 } from "paseto";
import path from "path"
import { logger } from "@src/providers/logger.provider";
/**
 * @module SSE Token Service
 * @description
 * Service responsible for creating and verifying PASETO tokens used by SSE (Server-Sent Events).
 * Manages automatic generation of PASETO keys in the .env file if they don't exist
 * and provides methods to sign and verify tokens using environment keys.
 */

export abstract class SseTokenService {
  public static async bootstrapSecurity() {
    const envPath = path.join(process.cwd(), ".env").toString();
    const privateKey = Bun.env.PASETO_PRIVATE_KEY;
    if (!privateKey) {
      const { publicKey, secretKey } = await V4.generateKey('public', { format: 'paserk' });

      if (!secretKey || !publicKey) {
        logger.error("Error generating PASETO keys");
        process.exit(1);
      }
      const env = Bun.file(envPath);
      if (!await env.exists()) {
        logger.warn(".env file not found. Creating a new one...");
        await Bun.write(envPath, `PASETO_PRIVATE_KEY=${secretKey}\nPASETO_PUBLIC_KEY=${publicKey}\n`);
        logger.info("✅ Keys generated and saved to environment.");
        logger.info("🛑 Restarting server to inject variables...");
        process.exit(1);
      }

      const existingEnv = await env.text();

      existingEnv.split("\n").forEach(line => {
        if (line.startsWith("PASETO_PRIVATE_KEY=") || line.startsWith("PASETO_PUBLIC_KEY=")) {
          logger.warn("PASETO keys already defined in .env. Please review the file and restart the server.");
          process.exit(1);
        }
      })

      await Bun.write(envPath, existingEnv.trim() + `\nPASETO_PRIVATE_KEY='${secretKey}'\nPASETO_PUBLIC_KEY='${publicKey}'\n`);

      logger.info("✅ Keys generated and saved to environment.");
      logger.info("🛑 Restarting server to inject variables...");

      process.exit(1);
    }
    logger.info("Identity loaded. System ready.");
  }
  /**
   * Generates and signs a PASETO token for SSE clients.
   * The token contains a claim { device: "sse-client" } and is signed
   * with the private key defined in PASETO_PRIVATE_KEY.
   * @returns {string} Signed PASETO token.
   */
  public static async generate(): Promise<string> {
    const token = await V4.sign({ device: "sse-client" }, Bun.env.PASETO_PRIVATE_KEY);
    return token;
  }
  /**
   * Verifies the signature and claims of a PASETO token using the public key
   * defined in PASETO_PUBLIC_KEY. Returns true only if the token is valid
   * and contains the claim device === "sse-client".
   * @param {string} token - PASETO token to validate.
   * @returns {boolean} True if the token is valid and belongs to an SSE client.
   */
  public static async validate(token: string): Promise<boolean> {
    try {
      const validation = await V4.verify(token, Bun.env.PASETO_PUBLIC_KEY)
      return validation && validation.device === "sse-client";
    } catch {
      return false;
    }
  }
}
