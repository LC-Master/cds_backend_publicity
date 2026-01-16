import { describe, expect, mock, test } from "bun:test";
import { typeSyncEnum } from "../src/enums/typeSync.enum";

const dto = {
  meta: { version: "v1", generated_at: new Date().toISOString() },
  data: { center_id: "0bd1a5f3-23e1-4f2b-9b1e-1f8c6d2c0a11", campaigns: [] },
};

describe("SyncService", () => {
  test("returns noChange when versions match", async () => {
    Bun.env.API_KEY_CMS = "token";
    Bun.env.CMS_ROUTE_SNAPSHOT = "https://example.com";
    Bun.env.FETCH_TIMEOUT_SECONDS = "1";
    const originalFetch = globalThis.fetch;
    globalThis.fetch = mock(
      async () =>
        new Response(JSON.stringify(dto), {
          status: 200,
          headers: { "content-type": "application/json" },
        })
    ) as unknown as typeof fetch;

    const { prisma } = await import("../src/providers/prisma");
    const { StorageService } = await import("../src/services/storage.service");
    const { MediaRepository } =
      await import("../src/repository/media.repository");
    const { PlaylistDataRepository } =
      await import("../src/repository/playlistData.repository");

    const originalTransaction = prisma.$transaction;
    const originalUpsert = prisma.syncState.upsert;
    const originalFilesExist = StorageService.filesExist;
    const originalDownload = StorageService.downloadAndVerifyFiles;
    const originalClean = StorageService.cleanTempFolder;
    const originalSaveMany = MediaRepository.saveMany;
    const originalSaveVersion = PlaylistDataRepository.saveVersion;

    const tx = {
      syncState: {
        findUnique: mock(async () => ({
          id: 1,
          syncing: false,
          syncStartedAt: null,
          syncVersion: "v1",
        })),
        update: mock(async () => ({})),
        create: mock(async () => ({})),
      },
    };
    prisma.$transaction = mock(async (cb: any) => cb(tx)) as any;
    prisma.syncState.upsert = mock(async () => ({})) as any;
    StorageService.filesExist = mock(async () => []);
    StorageService.downloadAndVerifyFiles = mock(async () => []);
    StorageService.cleanTempFolder = mock(async () => undefined);
    MediaRepository.saveMany = mock(async () => []);
    PlaylistDataRepository.saveVersion = mock(async () => ({
      id: 1,
      updatedAt: new Date(),
      version: "v1",
      rawJson: JSON.stringify(dto),
    }));

    const { SyncService } = await import("../src/services/sync.service");
    const result = await SyncService.syncData();
    expect(result?.type).toBe(typeSyncEnum.noChange);

    prisma.$transaction = originalTransaction;
    prisma.syncState.upsert = originalUpsert;
    StorageService.filesExist = originalFilesExist;
    StorageService.downloadAndVerifyFiles = originalDownload;
    StorageService.cleanTempFolder = originalClean;
    MediaRepository.saveMany = originalSaveMany;
    PlaylistDataRepository.saveVersion = originalSaveVersion;
    globalThis.fetch = originalFetch;
  });

  test("starts new sync when no state exists", async () => {
    Bun.env.API_KEY_CMS = "token";
    Bun.env.CMS_ROUTE_SNAPSHOT = "https://example.com";
    Bun.env.FETCH_TIMEOUT_SECONDS = "1";
    const originalFetch = globalThis.fetch;
    globalThis.fetch = mock(
      async () =>
        new Response(JSON.stringify(dto), {
          status: 200,
          headers: { "content-type": "application/json" },
        })
    ) as unknown as typeof fetch;

    const { prisma } = await import("../src/providers/prisma");
    const { StorageService } = await import("../src/services/storage.service");
    const { MediaRepository } =
      await import("../src/repository/media.repository");
    const { PlaylistDataRepository } =
      await import("../src/repository/playlistData.repository");

    const originalTransaction = prisma.$transaction;
    const originalUpsert = prisma.syncState.upsert;
    const originalFilesExist = StorageService.filesExist;
    const originalDownload = StorageService.downloadAndVerifyFiles;
    const originalClean = StorageService.cleanTempFolder;
    const originalSaveMany = MediaRepository.saveMany;
    const originalSaveVersion = PlaylistDataRepository.saveVersion;

    const tx = {
      syncState: {
        findUnique: mock(async () => null),
        update: mock(async () => ({})),
        create: mock(async () => ({})),
      },
    };
    prisma.$transaction = mock(async (cb: any) => cb(tx)) as any;
    prisma.syncState.upsert = mock(async () => ({})) as any;
    StorageService.filesExist = mock(async () => []);
    StorageService.downloadAndVerifyFiles = mock(async () => []);
    StorageService.cleanTempFolder = mock(async () => undefined);
    MediaRepository.saveMany = mock(async () => []);
    PlaylistDataRepository.saveVersion = mock(async () => ({
      id: 1,
      updatedAt: new Date(),
      version: "v1",
      rawJson: JSON.stringify(dto),
    }));

    const { SyncService } = await import("../src/services/sync.service");
    const result = await SyncService.syncData();
    expect(result?.type).toBe(typeSyncEnum.newSync);

    prisma.$transaction = originalTransaction;
    prisma.syncState.upsert = originalUpsert;
    StorageService.filesExist = originalFilesExist;
    StorageService.downloadAndVerifyFiles = originalDownload;
    StorageService.cleanTempFolder = originalClean;
    MediaRepository.saveMany = originalSaveMany;
    PlaylistDataRepository.saveVersion = originalSaveVersion;
    globalThis.fetch = originalFetch;
  });
});
