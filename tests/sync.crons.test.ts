import { describe, expect, mock, test } from "bun:test";
import { typeSyncEnum } from "../src/enums/typeSync.enum";

const logger = {
  info: mock(() => undefined),
  error: mock(() => undefined),
  warn: mock(() => undefined),
  fatal: mock(() => undefined),
};

mock.module("../src/providers/logger.provider", () => ({ logger }));

mock.module("@elysiajs/cron", () => {
  return {
    __esModule: true,
    default: (options: { run: () => Promise<void> }) => (app: any) => {
      void options.run();
      return app;
    },
  };
});

describe("syncCrons", () => {
  test("runs cron jobs on startup", async () => {
    const { prisma } = await import("../src/providers/prisma");
    const { syncEventInstance } = await import("../src/event/syncEvent");
    const { SyncService } = await import("../src/services/sync.service");
    const { PlaylistService } = await import("../src/services/playlist.service");
    const { StorageService } = await import("../src/services/storage.service");

    const originalEmit = syncEventInstance.emit;
    const originalSyncData = SyncService.syncData;
    const originalGenerate = PlaylistService.generate;
    const originalRetry = StorageService.retryFailedDownloads;
    const originalSyncStateFind = prisma.syncState.findUnique;
    const originalPlaylistFind = prisma.playlistData.findUnique;

    const emit = mock(() => true);
    const syncData = mock(async () => ({
      dto: { meta: { version: "v1", generated_at: new Date() }, data: { center_id: "test-center", campaigns: [] } },
      type: typeSyncEnum.noChange,
    }));
    const generate = mock(async () => ({
      am: [],
      pm: [],
    }));
    const retryFailedDownloads = mock(async () => undefined);

    syncEventInstance.emit = emit as any;
    SyncService.syncData = syncData;
    PlaylistService.generate = generate;
    StorageService.retryFailedDownloads = retryFailedDownloads;
    prisma.syncState.findUnique = mock(async () => ({ syncing: false })) as any;
    prisma.playlistData.findUnique = mock(async () => ({ rawJson: "{}" })) as any;

    await import("../src/crons/sync.crons");
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(syncData).toHaveBeenCalled();
    expect(generate).toHaveBeenCalled();
    expect(emit).toHaveBeenCalled();
    expect(retryFailedDownloads).toHaveBeenCalledTimes(1);

    syncEventInstance.emit = originalEmit;
    SyncService.syncData = originalSyncData;
    PlaylistService.generate = originalGenerate;
    StorageService.retryFailedDownloads = originalRetry;
    prisma.syncState.findUnique = originalSyncStateFind;
    prisma.playlistData.findUnique = originalPlaylistFind;
  });
});
