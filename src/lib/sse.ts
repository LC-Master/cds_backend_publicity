/**
 * @module SSE Helper
 * @description
 * Utilidad para serializar y encolar mensajes SSE al controller de un ReadableStream.
 */
import { z } from "zod";
import { logger } from "../providers/logger.provider";

const encoder = new TextEncoder();

/**
 * Encola un mensaje SSE formateado en el controller suministrado.
 */
export default function sse({
  event,
  data,
  controller,
}: {
  event?: string;
  controller: ReadableStreamDefaultController<any>;
  data: object;
}): void {
  const schema = z.object({
    data: z.object().nonoptional(),
    controller: z.object({
      enqueue: z.function(),
    }),
  });

  const result = schema.safeParse({ data, controller });

  if (!result.success) {
    logger.error({
      message: `[sse] Validation failed: ${JSON.stringify(
        result.error.format()
      )}`,
    });
    throw new Error(
      "Invalid SSE parameters: Check data content and controller state."
    );
  }

  const message = event
    ? `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
    : `data: ${JSON.stringify(data)}\n\n`;
  controller.enqueue(encoder.encode(message));
}
