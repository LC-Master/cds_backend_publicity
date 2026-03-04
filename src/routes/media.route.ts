/**
 * @module Media Route
 * @description
 * Sirve archivos desde `Media` sin cacheos en memoria del servidor.
 * Streaming directo de Bun.file().stream() para evitar retener buffers.
 */
import Elysia, { file } from "elysia";
import path from "path";
import { CONFIG } from "@src/config/config";

export const mediaRoute = new Elysia().get(
  "/media/*",
  async ({ request, set }) => {
    try {
      const url = new URL(request.url);
      const relative = decodeURIComponent(
        url.pathname.replace(/^\/api\/media\//, "")
      );
      const normalized = path.normalize(relative);
      const filePath = path.join(CONFIG.MEDIA_PATH, normalized);

      const baseResolved = path.resolve(CONFIG.MEDIA_PATH);
      const targetResolved = path.resolve(filePath);
      if (!targetResolved.startsWith(baseResolved)) {
        set.status = 400;
        return new Response("Invalid path", { status: 400 });
      }

      const bunFile = Bun.file(filePath);

      if (!(await bunFile.exists())) {
        set.status = 404;
        return new Response("Not found", { status: 404 });
      }

      set.headers = {
        "Content-Type": "application/octet-stream", 
        "Content-Disposition": `attachment; filename="${path.basename(filePath)}"`,
        "Content-Length": bunFile.size.toString(),
        "Cache-Control": "no-store",
      };

      return new Response(bunFile.stream());
    } catch (error) {
      set.status = 500;
      return new Response("Internal server error", { status: 500 });
    }
  }
);
