import Elysia from "elysia";
import sse from "../lib/sse";
import ms from "ms";
import { syncEventInstance } from "../event/syncEvent";

export const eventsRoute = new Elysia().get("events", () => {
  let cleanup: () => void;
  const stream = new ReadableStream({
    start(controller) {
      const interval = setInterval(() => {
        sse({
          data: { message: "ping" },
          controller,
        });
      }, ms("25s"));
      const onSync = () => {
        sse({
          event: "dto:updated",
          controller,
          data: { message: "Nuevo DTO sincronizado" },
        });
      };
      cleanup = () => {
        syncEventInstance.off("dto:updated", onSync);
        clearInterval(interval);
      };
      syncEventInstance.on("dto:updated", onSync);
    },
    cancel() {
      console.log("Client disconnected from SSE");
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
