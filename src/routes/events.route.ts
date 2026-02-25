import Elysia, { t } from "elysia";
import sse from "../lib/sse";
import ms from "ms";
import { syncEventInstance } from "../event/syncEvent";
import { logger } from "../providers/logger.provider";
import { SseTokenService } from "@src/services/sse-token.service";
import { Unauthorized } from "@src/schemas/Unauthorized.schema";

/**
 * @author Francisco A. Rojas F.
 * @module Events Route
 * * @description
 * Ruta para manejar **SSE (Server-Sent Events)**.
 * Notifica en tiempo real eventos de sincronización (DTO) y generación de playlists.
 * * @name eventsRoute
 * @method GET
 * @returns {ReadableStream} Stream de texto formateado como `text/event-stream`.
 * @example .use(eventsRoute)
 */
/**
 * Endpoint SSE que expone eventos en tiempo real para clientes conectados.
 * Validación de token SSE y envío de eventos `ping`, `dto:updated` y `playlist:generated`.
 */
export const eventsRoute = new Elysia().get(
  "/events",
  ({ status, cookie: { auth } }) => {

    if (!auth || !SseTokenService.validate(auth.value)) {
      throw status(401, { error: "Invalido o faltante SSE token" });
    }

    let cleanup: () => void;
    try {
      const stream = new ReadableStream({
        start(controller) {
          sse({
            data: { message: "ping" + " ".repeat(9000) },
            event: "ping",
            controller,
          });
          const interval = setInterval(() => {
            sse({
              data: { message: "ping" + " ".repeat(9000) },
              event: "ping",
              controller,
            });
          }, ms("22s"));

          const onDtoUpdated = () => {
            sse({
              event: "dto:updated " + " ".repeat(9000),
              controller,
              data: { message: "Nuevo DTO sincronizado" },
            });
          };

          const onPlaylistGenerated = () => {
            sse({
              event: "playlist:generated" + " ".repeat(9000),
              controller,
              data: { message: "Nueva playlist generada" },
            });
          };

          syncEventInstance.on("dto:updated", onDtoUpdated);
          syncEventInstance.on("playlist:generated", onPlaylistGenerated);

          cleanup = () => {
            syncEventInstance.off("dto:updated", onDtoUpdated);
            syncEventInstance.off("playlist:generated", onPlaylistGenerated);
            clearInterval(interval);
          };
        },
        cancel() {
          logger.info("Client disconnected from SSE");
          cleanup();
        },
      });

      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    } catch (err) {
      logger.error({
        message: `SSE connection error: ${(err as Error).message}`,
      });
      throw status(500, { error: "Error al establecer la conexión SSE" });
    }
  },
  {
    response: {
      200: t.String({
        description: "Flujo de eventos SSE",
        examples: ['data: {"message":"ping"}\n\n'],
      }),
      401: Unauthorized,
      500: t.Object(
        {
          error: t.String({
            description: "Mensaje de error al generar el token",
            examples: [
              "Mensaje de error que ocurrió al establecer la conexión SSE",
            ],
          }),
        },
        {
          title: "SSE Connection Error",
          description: "Error al establecer la conexión SSE",
        }
      ),
    },
    cookie: t.Cookie({
      auth: t.String({
        description: "Token de autenticación para SSE",
        examples: ["2|f1a8e4b-3c4d-5e6f-7g8h-9i0jklmnopqrst"],
      }),
    }),
    detail: {
      summary: "Events SSE endpoint",
      description:
        "SSE endpoint para notificaciones de eventos para cargar el nuevo playlist",
      tags: ["Events"],
    },
  }
);
