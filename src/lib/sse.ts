import { z } from "zod";

const encoder = new TextEncoder();

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
    console.error("❌ SSE Validation Failed:", result.error.format());
    throw new Error(
      "Invalid SSE parameters: Check data content and controller state."
    );
  }

  const message = event
    ? `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
    : `data: ${JSON.stringify(data)}\n\n`;
  controller.enqueue(encoder.encode(message));
}
