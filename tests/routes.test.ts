import { describe, expect, mock, test } from "bun:test";
import Elysia from "elysia";
import { healthRoute } from "../src/routes/health.route";
import { playlistRoute } from "../src/routes/playlist.route";
import { PlaylistService } from "../src/services/playlist.service";
import { SyncService } from "../src/services/sync.service";
import { prisma } from "../src/providers/prisma";
import path from "path";
import fs from "fs/promises";

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
    const playlistPath = path.join(process.cwd(), "playlist", "playlist.json");
    await fs.rm(playlistPath, { force: true });
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

  test("playlist route returns 409 when referenced media is missing", async () => {
    const app = new Elysia().use(playlistRoute);
    const playlistPath = path.join(process.cwd(), "playlist", "playlist.json");
    const originalSyncData = SyncService.syncData;
    const originalSyncStateFindUnique = prisma.syncState.findUnique;
    const syncDataMock = mock(async () => null);

    PlaylistService._resetRecoverySyncStateForTests();
    SyncService.syncData = syncDataMock as any;
    prisma.syncState.findUnique = mock(async () => ({ syncing: false })) as any;

    await Bun.write(
      playlistPath,
      JSON.stringify({
        campaigns: [
          {
            id: "c1",
            am: [
              {
                id: "m1",
                fileType: "mp4",
                start_at: new Date().toISOString(),
                end_at: new Date().toISOString(),
                position: 1,
              },
            ],
            pm: [],
          },
        ],
        place_holder: null,
      })
    );

    try {
      const res = await app.handle(new Request(`${baseUrl}/playlist`));
      expect(res.status).toBe(409);
      await Bun.sleep(20);
      expect(syncDataMock).toHaveBeenCalledTimes(1);
    } finally {
      SyncService.syncData = originalSyncData;
      prisma.syncState.findUnique = originalSyncStateFindUnique;
    }
  });
});
