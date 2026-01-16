import { describe, expect, test } from "bun:test";
import { dto } from "../src/schemas/dto.schema";

const validDto = {
  meta: {
    version: "v1",
    generated_at: "2026-01-01T00:00:00Z",
  },
  data: {
    center_id: "0bd1a5f3-23e1-4f2b-9b1e-1f8c6d2c0a11",
    campaigns: [
      {
        id: "12b4c6d9-0f9a-4e33-b7c2-6a3b2e8b9d31",
        title: "Campaign A",
        department: "Marketing",
        agreement: "Agreement",
        start_at: "2026-01-01T00:00:00Z",
        end_at: "2026-02-01T00:00:00Z",
        slots: {
          am: [
            {
              id: "6db1a6d7-52c8-4c5a-8b2d-3d1b8c57470f",
              name: "file-a.mp4",
              checksum: "0123456789abcdef0123456789abcdef",
              duration_seconds: 10,
              position: 1,
            },
          ],
          pm: [
            {
              id: "9a1a5f72-2c7b-4c92-a199-1a9e215e11b4",
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

describe("dto schema", () => {
  test("accepts a valid DTO", () => {
    const result = dto.safeParse(validDto);
    expect(result.success).toBe(true);
  });

  test("rejects invalid checksum", () => {
    const bad = structuredClone(validDto);
    bad.data.campaigns[0].slots.am[0].checksum = "not-a-checksum";
    const result = dto.safeParse(bad);
    expect(result.success).toBe(false);
  });
});
