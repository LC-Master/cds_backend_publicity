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
    ({ status }) => {
      try {
        const token = SseTokenService.generate();
        return status(201, { token });
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
            token: t.String({
              format: "uuid",
              $id: "token",
              examples: ["123e4567-e89b-12d3-a456-426614174000"],
              description: "Token de autenticación para el SSE",
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
