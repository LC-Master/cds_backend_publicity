import { describe, expect, mock, test } from "bun:test";
import Elysia from "elysia";
import { typeSyncEnum } from "../src/enums/typeSync.enum";

mock.module("../src/providers/logger.provider", () => ({
  logger: {
    info: mock(() => undefined),
    error: mock(() => undefined),
    warn: mock(() => undefined),
    fatal: mock(() => undefined),
  },
}));

describe("forceRoute", () => {
  test("returns 400 when force is false", async () => {
    const { SyncService } = await import("../src/services/sync.service");
    const { PlaylistService } = await import("../src/services/playlist.service");
    const { syncEventInstance } = await import("../src/event/syncEvent");
    const originalSyncData = SyncService.syncData;
    const originalGenerate = PlaylistService.generate;
    const originalEmit = syncEventInstance.emit;
    SyncService.syncData = mock(async () => ({
      dto: { meta: { version: "v1", generated_at: new Date() }, data: { center_id: "center-1", campaigns: [] } },
      type: typeSyncEnum.noChange,
    }));
    PlaylistService.generate = mock(async (_dto: any) => ({ am: [], pm: [] }));
    syncEventInstance.emit = mock(() => true) as any;

    const { forceRoute } = await import("../src/routes/force.route");
    const app = new Elysia().use(forceRoute);

    const res = await app.handle(
      new Request("http://localhost/sync/force", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ force: false }),
      })
    );

    expect(res.status).toBe(400);

    SyncService.syncData = originalSyncData;
    PlaylistService.generate = originalGenerate;
    syncEventInstance.emit = originalEmit;
  });

  test("runs sync when force is true", async () => {
    const { SyncService } = await import("../src/services/sync.service");
    const { PlaylistService } = await import("../src/services/playlist.service");
    const { syncEventInstance } = await import("../src/event/syncEvent");
    const originalSyncData = SyncService.syncData;
    const originalGenerate = PlaylistService.generate;
    const originalEmit = syncEventInstance.emit;
    const syncData = mock(async () => ({
      dto: { meta: { version: "v1", generated_at: new Date() }, data: { center_id: "center-1", campaigns: [] } },
      type: typeSyncEnum.noChange,
    }));
    const generate = mock(async (_dto: any) => ({ am: [], pm: [] }));
    const emit = mock(() => true);
    SyncService.syncData = syncData;
    PlaylistService.generate = generate;
    syncEventInstance.emit = emit as any;

    const { forceRoute } = await import("../src/routes/force.route");
    const app = new Elysia().use(forceRoute);

    const res = await app.handle(
      new Request("http://localhost/sync/force", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ force: true }),
      })
    );

    expect(res.status).toBe(200);
    expect(syncData).toHaveBeenCalledTimes(1);
    expect(generate).toHaveBeenCalledTimes(1);
    expect(emit).toHaveBeenCalledTimes(1);

    SyncService.syncData = originalSyncData;
    PlaylistService.generate = originalGenerate;
    syncEventInstance.emit = originalEmit;
  });
});
