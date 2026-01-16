import { afterEach, describe, expect, mock, test } from "bun:test";
import fs from "fs/promises";
import path from "path";
import { IFile } from "../types/file.type";

mock.module("../src/providers/logger.provider", () => ({
  logger: {
    error: mock(() => undefined),
    info: mock(() => undefined),
    warn: mock(() => undefined),
    fatal: mock(() => undefined),
  },
}));

const tempRoot = path.join(process.cwd(), "Media");
const tempDir = path.join(tempRoot, "temp");

async function ensureDirs() {
  await fs.mkdir(tempDir, { recursive: true });
}

describe("StorageService", () => {
  afterEach(async () => {
    await fs.rm(tempRoot, { recursive: true, force: true });
  });

  test("pathExists returns true for directory and false for missing", async () => {
    await ensureDirs();
    const { StorageService } = await import("../src/services/storage.service");
    expect(await StorageService.pathExists(tempDir)).toBe(true);
    expect(await StorageService.pathExists(path.join(tempRoot, "nope"))).toBe(
      false
    );
  });

  test("downloadAndVerifyFiles stores valid file", async () => {
    await ensureDirs();

    Bun.env.CMS_MEDIA_BASE_URL = "https://example.com";
    Bun.env.API_KEY_CMS = "token";
    const originalFetch = globalThis.fetch ;
    globalThis.fetch = mock(async () =>
      new Response("file-content", {
        status: 200,
        headers: { "content-type": "application/octet-stream" },
      }) 
    ) as unknown as typeof fetch;

    const content = "file-content";
    const checksum = Bun.MD5.hash(content, "hex");
    const file: IFile = {
      id: "abc",
      name: "file.mp4",
      checksum,
    };

    const { StorageService } = await import("../src/services/storage.service");
    const result = await StorageService.downloadAndVerifyFiles([file]);

    expect(result.length).toBe(1);
    expect(result[0].id).toBe("abc");
    expect(result[0].isDownloaded).toBe(true);
    const savedPath = path.join(tempRoot, "abc.mp4");
    const exists = await Bun.file(savedPath).exists();
    expect(exists).toBe(true);

    globalThis.fetch = originalFetch;
  });

  test("getDiskInfo returns numeric fields", async () => {
    const originalSpawn = Bun.spawnSync;
    if (process.platform === "win32") {
      Bun.spawnSync = mock(() => ({
        stdout: new TextEncoder().encode("Node,FreeSpace,Size\nC:,100,200\n"),
      })) as unknown as typeof Bun.spawnSync;
    } else {
      Bun.spawnSync = mock(() => ({
        stdout: new TextEncoder().encode("Filesystem 1024-blocks Used Available Use% Mounted on\n/dev/sda1 200 100 100 50% /\n"),
      })) as unknown as typeof Bun.spawnSync;
    }

    const { StorageService } = await import("../src/services/storage.service");
    const info = StorageService.getDiskInfo();

    expect(typeof info.free).toBe("number");
    expect(typeof info.size).toBe("number");
    expect(typeof info.used).toBe("number");

    Bun.spawnSync = originalSpawn;
  });
});
