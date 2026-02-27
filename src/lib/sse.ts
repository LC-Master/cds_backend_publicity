/**
 * @module SSE Helper
 * @description
 * Utilidad para serializar y encolar mensajes SSE al controller de un ReadableStream.
 */
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
  const message = event
    ? `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
    : `data: ${JSON.stringify(data)}\n\n`;
  controller.enqueue(encoder.encode(message));
}
