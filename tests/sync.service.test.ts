import { describe, expect, mock, test } from "bun:test";
import { typeSyncEnum } from "../src/enums/typeSync.enum";

const dto = {
  meta: { version: "v1", generated_at: new Date() },
  data: {
    center_id: "0bd1a5f3-23e1-4f2b-9b1e-1f8c6d2c0a11",
    campaigns: [
      {
        id: "d290f1ee-6c54-4b01-90e6-d701748f0851",
        title: "Test Campaign",
        department: "Marketing",
        agreement: "Agreement 1",
        start_at: new Date(),
        end_at: new Date(),
        slots: {
          am: [
            {
              id: "550e8400-e29b-41d4-a716-446655440000",
              name: "file1.mp4",
              checksum: "d41d8cd98f00b204e9800998ecf8427e",
              duration_seconds: 10,
              position: 1,
            },
          ],
          pm: [],
        },
      },
    ],
  },
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
    const originalFilesExist = StorageService.getMissingFiles;
    const originalDownload = StorageService.downloadAndVerifyFiles;
    const originalClean = StorageService.cleanTempFolder;
    const originalSaveMany = MediaRepository.saveMany;
    const originalSaveVersion = PlaylistDataRepository.saveVersion;
    
    // Mock prisma.media if needed (checkPhysicalMedia might use it via MediaService)
    if (!(prisma as any).media) (prisma as any).media = {};
    const originalMedia = (prisma as any).media;
    (prisma as any).media = {
        // En "noChange", DEBE existir en DB para no descargar
        findMany: mock(async () => [
            { id: "550e8400-e29b-41d4-a716-446655440000", checksum: "d41d8cd98f00b204e9800998ecf8427e" }
        ]), 
        upsert: mock(async () => ({})),
    };

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
        upsert: mock(async () => ({})),
      },
      playlistData: {
        findUnique: mock(async () => ({
          id: 1,
          version: "v1",
        })),
      },
    };
    prisma.$transaction = mock(async (cb: any) => cb(tx)) as any;
    prisma.syncState.upsert = mock(async () => ({})) as any;
    StorageService.getMissingFiles = mock(async () => []);
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
    // syncData returns the DTO on success (even if no change)
    expect(result).toEqual(dto);
    
    // Ensure download was NOT called
    expect(StorageService.downloadAndVerifyFiles).toHaveBeenCalledTimes(0);

    prisma.$transaction = originalTransaction;
    prisma.syncState.upsert = originalUpsert;
    StorageService.getMissingFiles = originalFilesExist;
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
    const originalFilesExist = StorageService.getMissingFiles;
    const originalDownload = StorageService.downloadAndVerifyFiles;
    const originalClean = StorageService.cleanTempFolder;
    const originalSaveMany = MediaRepository.saveMany;
    const originalSaveVersion = PlaylistDataRepository.saveVersion;

    // Mock prisma.media
    const originalMedia = (prisma as any).media;
    (prisma as any).media = {
      findMany: mock(async () => []),
      upsert: mock(async () => ({})),
    };

    const tx = {
      syncState: {
        findUnique: mock(async () => null),
        update: mock(async () => ({})),
        create: mock(async () => ({})),
        upsert: mock(async () => ({})),
      },
      playlistData: {
        findUnique: mock(async () => null),
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
    
    // syncData returns DTO on success
    expect(result).toEqual(dto);

    // Verify download was attempted
    expect(StorageService.downloadAndVerifyFiles).toHaveBeenCalled();

    prisma.$transaction = originalTransaction;
    if (originalMedia) (prisma as any).media = originalMedia;
    prisma.syncState.upsert = originalUpsert;
    StorageService.filesExist = originalFilesExist;
    StorageService.downloadAndVerifyFiles = originalDownload;
    StorageService.cleanTempFolder = originalClean;
    MediaRepository.saveMany = originalSaveMany;
    PlaylistDataRepository.saveVersion = originalSaveVersion;
    globalThis.fetch = originalFetch;
  });
});
