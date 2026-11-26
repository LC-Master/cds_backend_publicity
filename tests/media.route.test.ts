import { describe, expect, test, mock } from "bun:test";
import Elysia from "elysia";
import fs from "fs/promises";
import path from "path";
import { CONFIG } from "../src/config/config";

mock.module("@elysiajs/static", () => ({
  __esModule: true,
  default: ({ prefix }: { prefix: string }) =>
    (app: any) => app.get(`${prefix}/*`, () => new Response("ok")),
}));

describe("mediaRoute", () => {
  test("serves file when present", async () => {
    const mediaFile = path.join(CONFIG.MEDIA_PATH, "hello.txt");
    await fs.mkdir(CONFIG.MEDIA_PATH, { recursive: true });
    await Bun.write(mediaFile, "ok");

    const { mediaRoute } = await import("../src/routes/media.route");
    const app = new Elysia().use(mediaRoute);

    try {
      const res = await app.handle(new Request("http://localhost/media/hello.txt"));
      expect(res.status).toBe(200);
      const text = await res.text();
      expect(text).toBe("ok");
    } finally {
      await Bun.file(mediaFile).delete();
    }
  });
});
