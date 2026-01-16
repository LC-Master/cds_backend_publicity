import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { fetchDto } from "../src/providers/fetchDto";

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
          pm: [],
        },
      },
    ],
  },
};

describe("fetchDto", () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    Bun.env.API_KEY_CMS = "test";
    Bun.env.FETCH_TIMEOUT_SECONDS = "1";
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  test("returns parsed DTO on success", async () => {
    globalThis.fetch = (async () =>
      new Response(JSON.stringify(validDto), {
        status: 200,
        headers: { "content-type": "application/json" },
      })) as unknown as typeof fetch;

    const result = await fetchDto<typeof validDto>("https://example.com");
    expect(result?.meta.version).toBe("v1");
  });

  test("returns null when response is not ok", async () => {
    globalThis.fetch = (async () => new Response("", { status: 500 })) as unknown as typeof fetch;

    const result = await fetchDto<typeof validDto>("https://example.com");
    expect(result).toBeNull();
  });

  test("returns null when DTO validation fails", async () => {
    const invalid = { ...validDto, meta: { version: 1 } };
    globalThis.fetch = (async () =>
      new Response(JSON.stringify(invalid), {
        status: 200,
        headers: { "content-type": "application/json" },
      })) as unknown as typeof fetch;

    const result = await fetchDto<typeof validDto>("https://example.com");
    expect(result).toBeNull();
  });
});
