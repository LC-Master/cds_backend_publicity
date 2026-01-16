import { describe, expect, test, mock } from "bun:test";
import Elysia from "elysia";

mock.module("@elysiajs/static", () => ({
  __esModule: true,
  default: ({ prefix }: { prefix: string }) =>
    (app: any) => app.get(`${prefix}/*`, () => new Response("ok")),
}));

describe("mediaRoute", () => {
  test("serves file when present", async () => {
    const { mediaRoute } = await import("../src/routes/media.route");
    const app = new Elysia().use(mediaRoute);

    const res = await app.handle(new Request("http://localhost/media/hello.txt"));
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).toBe("ok");
  });
});
