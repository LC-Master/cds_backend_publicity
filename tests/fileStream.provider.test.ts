import { describe, expect, mock, test } from "bun:test";

mock.module("../src/providers/logger.provider", () => ({
  logger: {
    error: mock(() => undefined),
    info: mock(() => undefined),
    warn: mock(() => undefined),
    fatal: mock(() => undefined),
  },
}));

describe("fileStreamProvider", () => {
  test("throws on non-ok response", async () => {
    Bun.env.CMS_MEDIA_BASE_URL = "https://example.com";
    Bun.env.API_KEY_CMS = "token";

    const originalFetch = globalThis.fetch;
    globalThis.fetch = async () => new Response("", { status: 401 });

    const { default: fileStreamProvider } = await import(
      "../src/providers/fileStream.provider"
    );

    await expect(fileStreamProvider("123")).rejects.toThrow();
    globalThis.fetch = originalFetch;
  });

  test("throws when content-type is text/html", async () => {
    Bun.env.CMS_MEDIA_BASE_URL = "https://example.com";
    Bun.env.API_KEY_CMS = "token";

    const originalFetch = globalThis.fetch;
    globalThis.fetch = async () =>
      new Response("<html></html>", {
        status: 200,
        headers: { "content-type": "text/html" },
      });

    const { default: fileStreamProvider } = await import(
      "../src/providers/fileStream.provider"
    );

    await expect(fileStreamProvider("123")).rejects.toThrow();
    globalThis.fetch = originalFetch;
  });
});
