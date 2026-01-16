import { describe, expect, mock, test } from "bun:test";
import { IMediaFile } from "../types/file.type";

describe("MediaRepository", () => {
  test("saveMany calls upsert for each file", async () => {
    const { prisma } = await import("../src/providers/prisma");
    const originalUpsert = prisma.media.upsert;
    const originalTransaction = prisma.$transaction;
    const upsert = mock(async (args: unknown) => args);
    const $transaction = mock(async (txs: Promise<unknown>[]) =>
      Promise.all(txs)
    );
    prisma.media.upsert = upsert as any;
    prisma.$transaction = $transaction as any;
    const files: IMediaFile[] = [
      {
        id: "1",
        filename: "a.mp4",
        checksum: "0123456789abcdef0123456789abcdef",
        localPath: "/tmp/a.mp4",
        status: "downloaded",
        isDownloaded: true,
      },
      {
        id: "2",
        filename: "b.mp4",
        checksum: "abcdef0123456789abcdef0123456789",
        localPath: "/tmp/b.mp4",
        status: "error",
        isDownloaded: false,
      },
    ];

    const { MediaRepository } = await import("../src/repository/media.repository");
    const result = await MediaRepository.saveMany(files);

    expect(upsert).toHaveBeenCalledTimes(2);
    expect(result.length).toBe(2);

    prisma.media.upsert = originalUpsert;
    prisma.$transaction = originalTransaction;
  });
});
