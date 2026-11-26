import Elysia, { t } from "elysia";
import sse from "../lib/sse";
import ms from "ms";
import { syncEventInstance } from "../event/syncEvent";
import { logger } from "../providers/logger.provider";
import { SseTokenService } from "@src/services/sse-token.service";
import { Unauthorized } from "@src/schemas/Unauthorized.schema";

// Permitir más de 10 conexiones SSE simultáneas sin warnings.
syncEventInstance.setMaxListeners(0);

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
  async ({ status, cookie: { auth }, request }) => {
    if (!auth || !(await SseTokenService.validate(auth.value))) {
      throw status(401, { error: "Invalido o faltante SSE token" });
    }

    let cleaned = false;
    let cleanup = () => {};
    let abortHandler: (() => void) | null = null;
    let pingTimeout: Timer | null = null;
    try {
      const stream = new ReadableStream({
        start(controller) {
          const safeSend = ({ event, data }: { event?: string; data: object }) => {
            if (cleaned) return false;
            try {
              sse({
                data,
                event,
                controller,
              });
              return true;
            } catch (err) {
              logger.warn({
                message: "SSE send failed, cleaning connection",
                error: (err as Error).message,
              });
              cleanup();
              return false;
            }
          };

          if (!safeSend({ event: "ping", data: { message: "ping" } })) {
            return;
          }

          const schedulePing = () => {
            pingTimeout = setTimeout(() => {
              if (!safeSend({ event: "ping", data: { message: "ping" } })) {
                return;
              }
              schedulePing();
            }, ms("22s"));
          };
          schedulePing();

          const onDtoUpdated = () => {
            safeSend({
              event: "dto:updated",
              data: { message: "Nuevo DTO sincronizado" },
            });
          };

          const onPlaylistGenerated = () => {
            safeSend({
              event: "playlist:generated",
              data: { message: "Nueva playlist generada" },
            });
          };

          syncEventInstance.on("dto:updated", onDtoUpdated);
          syncEventInstance.on("playlist:generated", onPlaylistGenerated);

          cleanup = () => {
            if (cleaned) return;
            cleaned = true;
            if (pingTimeout) clearTimeout(pingTimeout);
            syncEventInstance.off("dto:updated", onDtoUpdated);
            syncEventInstance.off("playlist:generated", onPlaylistGenerated);
            if (abortHandler) {
              request.signal.removeEventListener("abort", abortHandler);
            }
          };

          abortHandler = () => cleanup();
          request.signal.addEventListener("abort", abortHandler, { once: true });
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
