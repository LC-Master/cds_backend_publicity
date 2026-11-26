import { describe, expect, mock, test } from "bun:test";

mock.module("../src/providers/logger.provider", () => ({
  logger: {
    error: mock(() => undefined),
    info: mock(() => undefined),
    warn: mock(() => undefined),
    fatal: mock(() => undefined),
  },
}));

const fetchAuthMock = mock(async () => ({ ok: true }));
mock.module("@src/providers/fetchAuth", () => ({
  fetchAuth: fetchAuthMock,
}));
mock.module("../src/providers/fetchAuth", () => ({
  fetchAuth: fetchAuthMock,
}));

describe("HealthService", () => {
  test("reports health to CMS", async () => {
    const { StorageService } = await import("../src/services/storage.service");
    const { MediaRepository } = await import("../src/repository/media.repository");
    const { prisma } = await import("../src/providers/prisma");
    const { healthEnum } = await import("../src/enums/health.enum");
    const originalGetDiskInfo = StorageService.getDiskInfo;
    const originalGetFilesWithError = MediaRepository.getFilesWithError;
    const originalGetCount = MediaRepository.getCount;
    const originalSyncState = prisma.syncState.findUnique;
    const originalSyncStateUpdate = prisma.syncState.update;
    const originalPlaylist = prisma.playlistData.findUnique;

    StorageService.getDiskInfo = mock(() => ({ free: 1, size: 2, used: 1 }));
    MediaRepository.getFilesWithError = mock(async () => []) as any;
    MediaRepository.getCount = mock(async () => 0) as any;
    prisma.syncState.findUnique = mock(
      async () => ({ syncing: false, syncVersion: "hash" })
    ) as any;
    prisma.syncState.update = mock(async () => ({})) as any;
    prisma.playlistData.findUnique = mock(async () => ({ version: "hash" })) as any;

    Bun.env.CMS_BASE_URL = "https://example.com";

    const { HealthService } = await import("../src/services/health.service");
    await HealthService.isHealthy(healthEnum.SYNCING, new Date(), new Date());

    expect(fetchAuthMock).toHaveBeenCalledTimes(1);
    fetchAuthMock.mockClear();

    StorageService.getDiskInfo = originalGetDiskInfo;
    MediaRepository.getFilesWithError = originalGetFilesWithError;
    MediaRepository.getCount = originalGetCount;
    prisma.syncState.findUnique = originalSyncState;
    prisma.syncState.update = originalSyncStateUpdate;
    prisma.playlistData.findUnique = originalPlaylist;
  });
});
