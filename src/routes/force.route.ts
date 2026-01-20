import Elysia, { status, t } from "elysia";
import { syncEventInstance } from "../event/syncEvent";
import { logger } from "../providers/logger.provider";
import { PlaylistService } from "../services/playlist.service";
import { SyncService } from "../services/sync.service";
import { typeSyncEnum } from "../enums/typeSync.enum";
import { authPlugin } from "@src/plugin/auth.plugin";
import TokenService from "@src/services/token.service";
import { Unauthorized } from "@src/schemas/Unauthorized.schema";

export const forceRoute = new Elysia({
  prefix: "/sync",
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
  .post(
    "/force",
    async ({ body }) => {
      const { force } = body;
      logger.info({ message: "Force sync requested", force });
      if (!force)
        throw status(400, { error: "Parámetro force debe ser verdadero" });
      // Run sync in background
      (async () => {
        try {
          const result = await SyncService.syncData();
          if (
            result?.dto &&
            (result.type === typeSyncEnum.noChange ||
              result.type === typeSyncEnum.newSync)
          ) {
            await PlaylistService.generate(result.dto);
            syncEventInstance.emit("dto:updated", true);
          }
        } catch (err: any) {
          logger.error({ message: `Force sync failed: ${err.message}` });
          return status(500, { error: "Error al forzar la sincronización" });
        } finally {
          logger.info({
            message: "Force Sync Finished",
            time: new Date().toLocaleString(),
          });
        }
      })();
      return status(200, { message: "Sincronización forzada iniciada" });
    },
    {
      body: t.Object(
        {
          force: t.Boolean({
            error: "force debe ser un booleano",
            description: "Indica si se debe forzar la sincronización de datos",
            examples: [true],
          }),
        },
        {
          title: "Force Sync Request Body",
          description:
            "Cuerpo de la solicitud para forzar la sincronización de datos",
          examples: [{ force: true }, { force: false }],
        }
      ),
      response: {
        200: t.Object(
          {
            message: t.String({
              description:
                "Mensaje de éxito al iniciar la sincronización forzada",
            }),
          },
          {
            title: "Sincronización Iniciada",
            description:
              "Respuesta exitosa al iniciar la sincronización forzada",
          }
        ),
        401: Unauthorized,
        400: t.Object(
          {
            error: t.String({
              description: "Mensaje de error en los parámetros de la solicitud",
            }),
          },
          {
            title: "Bad Request",
            description: "Error en los parámetros de la solicitud",
          }
        ),
        500: t.Object(
          {
            error: t.String({
              description: "Mensaje de error interno al forzar la sincronización",
            }),
          },
          {
            title: "Internal Server Error",
            description: "Error interno al forzar la sincronización",
          }
        ),
      },
      summary: "Force Data Synchronization",
      detail: {
        description: "EndPoint para forzar la sincronización de datos.",
        tags: ["Synchronization"],
      },
    }
  )
  .post(
    "/force/token",
    async ({ body, jwt }) => {
      const { generate } = body;
      if (!generate)
        throw status(400, { error: "Parámetro generate debe ser verdadero" });
      try {
        await TokenService.createApiKey(jwt);
        logger.info({ message: "Force token generation requested", generate });
        return status(201, { message: "Generación de token forzada iniciada" });
      } catch (err: any) {
        throw status(500, { error: "Error generando el token" });
      }
    },
    {
      body: t.Object(
        {
          generate: t.Boolean({
            error: "generate debe ser un booleano",
            description: "Campo que indica si se debe generar un nuevo token",
          }),
        },
        {
          title: "Force Token Generation Request Body",
          description:
            "Cuerpo de la solicitud para forzar la generación de un nuevo token de API",
          examples: [{ generate: true }],
        }
      ),
      response: {
        201: t.Object(
          {
            message: t.String({
              description:
                "Mensaje de éxito al iniciar la generación del token",
            }),
          },
          {
            title: "Token Generation Success",
            description: "Respuesta exitosa al iniciar la generación del token",
          }
        ),
        401: Unauthorized,
        400: t.Object({
          error: t.String({
            description: "Mensaje de error en los parámetros de la solicitud",
          }),
        },{
          title: "Bad Request",
          description: "Error en los parámetros de la solicitud",
        }),
        500: t.Object(
          {
            error: t.String({
              description: "Mensaje de error al generar el token",
            }),
          },
          {
            title: "Internal Server Error",
            description: "Error interno al generar el token",
          }
        ),
      },
      detail: {
        summary: "Force Token Generation",
        description:
          "EndPoint para forzar la generación de un nuevo token de API.",
        tags: ["Authentication", "Token"],
      },
    }
  );
