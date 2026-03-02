/**
 * @module Media Route
 * @description
 * Sirve archivos desde `Media` sin cacheos en memoria del servidor.
 * Streaming directo de Bun.file().stream() para evitar retener buffers.
 */
import Elysia from "elysia";
import path from "path";
import { CONFIG } from "@src/config/config";

export const mediaRoute = new Elysia().get(
  "/media/*",
  async ({ request, set }) => {
    const url = new URL(request.url);
    const relative = url.pathname.replace(/^\/media\//, "");
    const filePath = path.join(CONFIG.MEDIA_PATH, relative);
    const file = Bun.file(filePath);

    if (!(await file.exists())) {
      set.status = 404;
      return new Response("Not found", { status: 404 });
    }

    const range = request.headers.get("range");
    if (range) {
      const size = file.size;
      const match = /bytes=(\d+)-(\d*)/.exec(range);
      if (match) {
        const start = Number(match[1]);
        const end = match[2] ? Number(match[2]) : size - 1;
        const chunk = file.slice(start, end + 1);
        set.status = 206;
        set.headers = {
          "Content-Range": `bytes ${start}-${end}/${size}`,
          "Accept-Ranges": "bytes",
          "Content-Length": `${chunk.size}`,
        };
        return new Response(chunk.stream());
      }
    }

    set.headers = {
      "Accept-Ranges": "bytes",
      "Cache-Control": "no-store",
    };
    return new Response(file.stream());
  }
);
