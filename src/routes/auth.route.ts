/**
 * @module Auth Route
 * @description
 * Rutas para autenticación de dispositivos y emisión de tokens de SSE.
 */
import { authPlugin } from "@src/plugin/auth.plugin";
import { logger } from "@src/providers/logger.provider";
import { Unauthorized } from "@src/schemas/Unauthorized.schema";
import { SseTokenService } from "@src/services/sse-token.service";
import Elysia, { t } from "elysia";

export const authRoute = new Elysia({
  cookie: {
    secrets: [Bun.env.API_KEY_CMS],
    sign: true,
    secure: Bun.env.NODE_ENV === "production",
  },
  detail: {
    parameters: [
      {
        name: "Authorization",
        in: "header",
        required: true,
        schema: { type: "string", example: "Bearer your_token_here" },
        description: "Token de acceso JWT",
      },
    ],
  },
})
  .use(authPlugin)
  .get(
    "/auth/login/device",
    async ({ status, cookie: { auth }, jwt }) => {
      try {
        // Ensure API key exists and is not expired; if missing or expired, regenerate.
        try {
          const expiry = await (await import("@src/repository/token.repository")).TokenRepository.getExpiry();
          const now = new Date();
          if (!expiry || expiry <= now) {
            await (await import("@src/services/token.service")).default.createApiKey(jwt);
          }
        } catch (err) {
          // non-fatal: if DB check fails, still proceed to issue SSE token
          logger.warn({ message: "Could not verify API key expiry before device login", error: (err as Error).message });
        }
        const token = await SseTokenService.generate();
        auth.set({
          httpOnly: true,
          sameSite: "lax",
          secure: Bun.env.NODE_ENV === "production",
          path: "/api/events",
          expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          value: token,
        });
        return status(201, { message: "created" });
      } catch (err) {
        logger.error({
          err,
          message: "Error Generando Token de SSE",
        });
        return status(500, { error: "Error generando token SSE" });
      }
    },
    {
      response: {
        201: t.Object(
          {
            message: t.String({
              $id: "pasetoToken",
              examples: ["created"],
              description: "Mensaje de éxito al generar el token de SSE",
            }),
          },
          {
            title: "Device Login Response",
            description: "Respuesta exitosa con el token de SSE",
            examples: [{ token: "123e4567-e89b-12d3-a456-426614174000" }],
            $id: "DeviceLoginResponse",
          }
        ),
        401: Unauthorized,
        500: t.Object(
          {
            error: t.String({
              description: "Mensaje de error",
              examples: ["Error generando token SSE"],
              title: "Error Message",
            }),
          },
          {
            title: "Internal Server Error",
            description: "Error interno al generar el token de SSE",
            examples: [{ error: "Error generando token SSE" }],
            $id: "InternalServerErrorResponse",
          }
        ),
      },
      detail: {
        description: "Endpoint para autenticar un dispositivo para SSE.",
        summary: "Device Login",
        tags: ["Authentication"],
      },
    }
  );
