import { describe, expect, mock, test } from "bun:test";
import sse from "../src/lib/sse";

const decoder = new TextDecoder();

describe("sse", () => {
  test("enqueues event payload", () => {
    const enqueue = mock((chunk: Uint8Array) => chunk);
    sse({
      event: "dto:updated",
      data: { message: "ok" },
      controller: { enqueue } as unknown as ReadableStreamDefaultController,
    });

    expect(enqueue).toHaveBeenCalledTimes(1);
    const payload = enqueue.mock.calls[0][0] as Uint8Array;
    const text = decoder.decode(payload);
    expect(text).toContain("event: dto:updated");
    expect(text).toContain("data: {\"message\":\"ok\"}");
  });

  test("throws when controller is invalid", () => {
    expect(() =>
      sse({
        data: { message: "ok" },
        controller: {} as ReadableStreamDefaultController,
      })
    ).toThrow();
  });
});
