import { describe, expect, mock, test } from "bun:test";
import { ISnapshotDto } from "../types/dto.type";

describe("PlaylistDataRepository", () => {
  test("uses dto.meta.version as version (hash)", async () => {
    const { prisma } = await import("../src/providers/prisma");
    const originalUpsert = prisma.playlistData.upsert;
    const upsert = mock(async (args: unknown) => args);
    prisma.playlistData.upsert = upsert as any;
    const dto: ISnapshotDto = {
      meta: { version: "hash-abc", generated_at: new Date() },
      data: { store_id: 301, campaigns: [] },
    };

    const { PlaylistDataRepository } = await import(
      "../src/repository/playlistData.repository"
    );

    await PlaylistDataRepository.saveVersion(dto);
    const callArgs = upsert.mock.calls[0]?.[0] as any;
    expect(callArgs.create.version).toBe("hash-abc");

    prisma.playlistData.upsert = originalUpsert;
  });
});
