import { afterEach, describe, expect, mock, test } from "bun:test";
import fs from "fs/promises";
import path from "path";
import { ISnapshotDto } from "../types/dto.type";

mock.module("../src/providers/logger.provider", () => ({
  logger: {
    error: mock(() => undefined),
    info: mock(() => undefined),
    warn: mock(() => undefined),
    fatal: mock(() => undefined),
  },
}));

const playlistDir = path.join(process.cwd(), "playlist");

afterEach(async () => {
  await fs.rm(playlistDir, { recursive: true, force: true });
});

describe("PlaylistService", () => {
  test("generates playlist with downloaded media only", async () => {
    const { prisma } = await import("../src/providers/prisma");
    const { StorageService } = await import("../src/services/storage.service");
    const { MediaRepository } = await import("../src/repository/media.repository");
    const originalFindMany = prisma.media.findMany;
    const originalPathExists = StorageService.pathExists;
    const originalGetFilesDownloaded = MediaRepository.getFilesDownloaded;
    const originalRemoveOrphanMedia = StorageService.removeOrphanMedia;
    prisma.media.findMany = mock(async () => [{ id: "m1" }]) as unknown as typeof prisma.media.findMany;
    StorageService.pathExists = mock(async () => true) as unknown as typeof StorageService.pathExists;
    MediaRepository.getFilesDownloaded = mock(async () => ([{ id: "m1" }])) as any;
    StorageService.removeOrphanMedia = mock(async () => undefined) as any;

    const dto: ISnapshotDto = {
      meta: { version: "hash-123", generated_at: new Date() },
      data: {
        store_id: 201,
        campaigns: [
          {
            id: "c1",
            title: "T1",
            department: "D1",
            agreements: ["A1"],
            start_at: new Date(Date.now() - 1000),
            end_at: new Date(Date.now() + 1000),
            slots: {
              am: [
                {
                  id: "m1",
                  name: "file-a.mp4",
                  checksum: "0123456789abcdef0123456789abcdef",
                  duration_seconds: 10,
                  position: 1,
                },
              ],
              pm: [
                {
                  id: "m2",
                  name: "file-b.mp4",
                  checksum: "abcdef0123456789abcdef0123456789",
                  duration_seconds: 20,
                  position: 2,
                },
              ],
            },
          },
        ],
      },
    };

    const { PlaylistService } = await import("../src/services/playlist.service");
    const result = await PlaylistService.generate(dto);

    prisma.media.findMany = originalFindMany;
    StorageService.pathExists = originalPathExists;
    MediaRepository.getFilesDownloaded = originalGetFilesDownloaded;
    StorageService.removeOrphanMedia = originalRemoveOrphanMedia;

    expect(result.campaigns[0].am.length).toBe(1);
    expect(result.campaigns[0].pm.length).toBe(0);
    expect(result.place_holder).toBeNull();
  });
});
