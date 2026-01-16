import { describe, expect, test } from "bun:test";
import Elysia from "elysia";
import { healthRoute } from "../src/routes/health.route";
import { playlistRoute } from "../src/routes/playlist.route";
import path from "path";

const baseUrl = "http://localhost";

describe("routes", () => {
  test("health route returns ok", async () => {
    const app = new Elysia().use(healthRoute);
    const res = await app.handle(new Request(`${baseUrl}/health`));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.status).toBe("ok");
  });

  test("playlist route returns 404 when missing", async () => {
    const app = new Elysia().use(playlistRoute);
    const res = await app.handle(new Request(`${baseUrl}/playlist`));
    expect(res.status).toBe(404);
  });

  test("playlist route returns file when present", async () => {
    const app = new Elysia().use(playlistRoute);
    const playlistPath = path.join(process.cwd(), "playlist", "playlist.json");
    await Bun.write(playlistPath, JSON.stringify({ ok: true }));

    const res = await app.handle(new Request(`${baseUrl}/playlist`));
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).toContain("ok");
  });
});
