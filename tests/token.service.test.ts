import { describe, expect, mock, test } from "bun:test";

mock.module("../src/providers/logger.provider", () => ({
  logger: {
    info: mock(() => undefined),
    warn: mock(() => undefined),
    error: mock(() => undefined),
  },
}));

describe("TokenService", () => {
  test("tokenApiExists returns false when no token", async () => {
    mock.module("../src/repository/token.repository", () => ({
      TokenRepository: { exists: mock(async () => false) },
    }));

    const { default: TokenService } =
      await import("../src/services/token.service");
    expect(await TokenService.tokenApiExists()).toBe(false);
  });

  test("tokenApiExists returns true when token exists", async () => {
    mock.module("../src/repository/token.repository", () => ({
      TokenRepository: { exists: mock(async () => true) },
    }));

    const { default: TokenService } =
      await import("../src/services/token.service");
    expect(await TokenService.tokenApiExists()).toBe(true);
  });

  test("createApiKey saves hash", async () => {
    const saved = mock(async (hash: string) => ({ key: hash }));
    mock.module("../src/repository/token.repository", () => ({
      TokenRepository: { save: saved },
    }));

    const jwtMock = { sign: mock(async () => "raw.jwt.token") };

    // Mock jwt.schema to return valid
    mock.module("../src/schemas/jwt.schema.ts", () => ({
      jwtSchema: {
        safeParse: (t: string) => ({
          success: true,
          data: "secret",
        }),
      },
    }));

    const { default: TokenService } =
      await import("../src/services/token.service");

    await TokenService.createApiKey(jwtMock as any);

    expect(saved).toHaveBeenCalledTimes(1);
  });
});
