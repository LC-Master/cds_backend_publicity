import Elysia from "elysia";
import sse from "../lib/sse";
import ms from "ms";
import { syncEventInstance } from "../event/syncEvent";
import { logger } from "../providers/logger.provider";

export const eventsRoute = new Elysia().get("/events", () => {
  let cleanup: () => void;
  const stream = new ReadableStream({
    start(controller) {
      const interval = setInterval(() => {
        sse({
          data: { message: "ping" },
          controller,
        });
      }, ms("25s"));

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
});
