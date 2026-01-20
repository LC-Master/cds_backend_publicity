/**
 * @module SSE Token Service
 * @description
 * Servicio ligero para generar y validar tokens temporales usados por SSE.
 * Mantiene los tokens en memoria (Set) para validación simple de dispositivos.
 */
const Token_SSE_Container: Set<string> = new Set();

export abstract class SseTokenService {
  /**
   * Genera un token UUIDv7 para usar en SSE y lo registra en memoria.
   * @returns {string} Token generado.
   */
  public static generate() {
    const token = Bun.randomUUIDv7();
    Token_SSE_Container.add(token);
    return token;
  }
  /**
   * Valida si un token existe en el contenedor en memoria.
   * @param {string} token - Token a validar.
   * @returns {boolean} True si existe, false si no.
   */
  public static validate(token: string) {
    return Token_SSE_Container.has(token);
  }
}
