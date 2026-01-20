import Elysia, { t } from "elysia";
import sse from "../lib/sse";
import ms from "ms";
import { syncEventInstance } from "../event/syncEvent";
import { logger } from "../providers/logger.provider";
import { SseTokenService } from "@src/services/sse-token.service";
import { Unauthorized } from "@src/schemas/Unauthorized.schema";

export const eventsRoute = new Elysia().get(
  "/events",
  ({ query, status }) => {
    const { token } = query;

    if (!token || !SseTokenService.validate(token)) {
      throw status(401, { error: "Invalido o faltante SSE token" });
    }

    let cleanup: () => void;
    try {
      const stream = new ReadableStream({
        start(controller) {
          sse({
            data: { message: "ping" },
            event: "ping",
            controller,
          });
          const interval = setInterval(() => {
            sse({
              data: { message: "ping" },
              event: "ping",
              controller,
            });
          }, ms("24s"));

          const onDtoUpdated = () => {
            sse({
              event: "dto:updated",
              controller,
              data: { message: "Nuevo DTO sincronizado" },
            });
          };

          const onPlaylistGenerated = () => {
            sse({
              event: "playlist:generated",
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
    headers: t.Object(
      {
        "Content-Type": t.String({
          description: "Tipo de contenido de la respuesta",
          examples: ["text/event-stream"],
        }),
        "Cache-Control": t.String({
          description: "Control de caché para la respuesta",
          examples: ["no-cache"],
        }),
      },
      {
        title: "SSE Headers",
        description: "Headers de la respuesta SSE",
      }
    ),
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
    query: t.Object(
      {
        token: t.String({
          title: "SSE Auth Token",
          error: "Invalido o Faltante SSE token",
          description: "Token de autenticación para el SSE",
          examples: ["2|f1a8e4b-3c4d-5e6f-7g8h-9i0jklmnopqrst"],
        }),
      },
      {
        title: "SSE Token Query",
        description: "Query parameters for SSE Auth",
        examples: [{ token: "?token=tu_api_key" }],
      }
    ),
    detail: {
      summary: "Events SSE endpoint",
      description:
        "SSE endpoint para notificaciones de eventos para cargar el nuevo playlist",
      tags: ["Events"],
    },
  }
);
