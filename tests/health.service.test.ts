import { describe, expect, mock, test } from "bun:test";

mock.module("../src/providers/logger.provider", () => ({
  logger: {
    error: mock(() => undefined),
    info: mock(() => undefined),
    warn: mock(() => undefined),
    fatal: mock(() => undefined),
  },
}));

describe("HealthService", () => {
  test("reports health to CMS", async () => {
    const { StorageService } = await import("../src/services/storage.service");
    const { prisma } = await import("../src/providers/prisma");
    const originalGetDiskInfo = StorageService.getDiskInfo;
    const originalFindMany = prisma.media.findMany;
    const originalCount = prisma.media.count;
    const originalSyncState = prisma.syncState.findUnique;
    const originalPlaylist = prisma.playlistData.findUnique;

    StorageService.getDiskInfo = mock(() => ({ free: 1, size: 2, used: 1 }));
    prisma.media.findMany = mock(async () => []) as any;
    prisma.media.count = mock(async () => 0) as any;
    prisma.syncState.findUnique = mock(
      async () => ({ syncing: false, syncVersion: "hash" })
    ) as any;
    prisma.playlistData.findUnique = mock(async () => ({ version: "hash" })) as any;

    Bun.env.CMS_BASE_URL = "https://example.com";
    const originalFetch = globalThis.fetch;
    globalThis.fetch = mock(async () => new Response("", { status: 200 })) as unknown as typeof fetch;

    const { HealthService } = await import("../src/services/health.service");
    await HealthService.isHealthy();

    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    globalThis.fetch = originalFetch;

    StorageService.getDiskInfo = originalGetDiskInfo;
    prisma.media.findMany = originalFindMany;
    prisma.media.count = originalCount;
    prisma.syncState.findUnique = originalSyncState;
    prisma.playlistData.findUnique = originalPlaylist;
  });
});
