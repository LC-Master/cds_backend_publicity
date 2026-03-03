import { V4 } from "paseto";
import path from "path"
import { logger } from "@src/providers/logger.provider";
/**
 * @module SSE Token Service
 * @description
 * Servicio responsable de crear y verificar tokens PASETO usados por SSE (Server-Sent Events).
 * Gestiona la generación automática de claves PASETO en el archivo .env si no existen
 * y ofrece métodos para firmar y verificar tokens con las claves del entorno.
 */

export abstract class SseTokenService {
  public static async bootstrapSecurity() {
    const envPath = path.join(process.cwd(), ".env").toString();
    const privateKey = Bun.env.PASETO_PRIVATE_KEY;
    if (!privateKey) {
      const { publicKey, secretKey } = await V4.generateKey('public', { format: 'paserk' });

      if (!secretKey || !publicKey) {
        logger.error("Error generando claves PASETO");
        process.exit(1);
      }
      const env = Bun.file(envPath);
      if (!await env.exists()) {
        logger.warn("Archivo .env no encontrado. Creando uno nuevo...");
        await Bun.write(envPath, `PASETO_PRIVATE_KEY=${secretKey}\nPASETO_PUBLIC_KEY=${publicKey}\n`);
        logger.info("✅ Llaves generadas y guardadas en el entorno.");
        logger.info("🛑 Reiniciando servidor para inyectar variables...");
        process.exit(0);
      }

      const existingEnv = await env.text();

      existingEnv.split("\n").forEach(line => {
        if (line.startsWith("PASETO_PRIVATE_KEY=") || line.startsWith("PASETO_PUBLIC_KEY=")) {
          logger.warn("Llaves PASETO ya definidas en .env. Por favor, revisa el archivo y reinicia el servidor.");
          process.exit(1);
        }
      })

      await Bun.write(envPath, existingEnv.trim() + `\nPASETO_PRIVATE_KEY='${secretKey}'\nPASETO_PUBLIC_KEY='${publicKey}'\n`);

      logger.info("✅ Llaves generadas y guardadas en el entorno.");
      logger.info("🛑 Reiniciando servidor para inyectar variables...");
      
      process.exit(0);
    }
    logger.info("Identidad cargada. Sistema listo.");
  }
  /**
   * Genera y firma un token PASETO para clientes SSE.
   * El token contiene una claim { device: "sse-client" } y está firmado
   * con la clave privada definida en PASETO_PRIVATE_KEY.
   * @returns {string} Token PASETO firmado.
   */
  public static async generate(): Promise<string> {
    const token = await V4.sign({ device: "sse-client" }, Bun.env.PASETO_PRIVATE_KEY);
    return token;
  }
  /**
   * Verifica la firma y las claims de un token PASETO usando la clave pública
   * definida en PASETO_PUBLIC_KEY. Devuelve true solo si el token es válido
   * y contiene la claim device === "sse-client".
   * @param {string} token - Token PASETO a validar.
   * @returns {boolean} True si el token es válido y pertenece a un cliente SSE.
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
