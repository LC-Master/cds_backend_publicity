import Elysia, { status, t } from "elysia";
import { syncEventInstance } from "../event/syncEvent";
import { logger } from "../providers/logger.provider";
import { PlaylistService } from "../services/playlist.service";
import { SyncService } from "../services/sync.service";
import { typeSyncEnum } from "../enums/typeSync.enum";
import { auth } from "@src/plugin/auth.plugin";
import TokenService from "@src/services/token.service";

export const forceRoute = new Elysia({ prefix: "/sync" })
  .use(auth)
  .post(
    "/force",
    async ({ body }) => {
      const { force } = body;
      logger.info({ message: "Force sync requested", force });
      if (!force) throw status(400, "Parámetro force debe ser true");
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
        } finally {
          logger.info({
            message: "Force Sync Finished",
            time: new Date().toLocaleString(),
          });
        }
      })();
      return status(200, "Sincronización forzada iniciada");
    },
    {
      body: t.Object({
        force: t.Boolean({
          error: "force debe ser un booleano",
          description: "Indica si se debe forzar la sincronización de datos",
        }),
      }),
      response: {
        200: t.String({
          description: "Mensaje de éxito al iniciar la sincronización forzada",
        }),
        400: t.String({
          description: "Error en los parámetros de la solicitud",
        }),
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
      if (!generate) throw status(400, "Parámetro generate debe ser true");
      try {
        await TokenService.createApiKey(jwt);
        logger.info({ message: "Force token generation requested", generate });
        return status(200, "Generación de token forzada iniciada");
      } catch (err: any) {
        throw status(500, "Error generando el token");
      }
    },
    {
      body: t.Object({
        generate: t.Boolean({
          error: "generate debe ser un booleano",
          description: "Indica si se debe generar un nuevo token de API",
        }),
      }),
      response: {
        200: t.String({
          description: "Mensaje de éxito al iniciar la generación del token",
        }),
        400: t.String({
          description: "Error en los parámetros de la solicitud",
        }),
        500: t.String({
          description: "Error interno al generar el token",
        }),
      },
      detail: {
        summary: "Force Token Generation",
        description:
          "EndPoint para forzar la generación de un nuevo token de API.",
        tags: ["Authentication", "Token"],
      },
    }
  );
