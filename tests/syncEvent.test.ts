import { describe, expect, test } from "bun:test";
import { syncEventInstance } from "../src/event/syncEvent";

const minimalDto = {
  meta: { version: "v1", generated_at: new Date() },
  data: { store_id: 601, campaigns: [] },
};

describe("syncEvent", () => {
  test("emits and listens to typed events", () => {
    syncEventInstance.removeAllListeners("playlist:generated");
    let received = false;
    const handler = (payload: boolean) => {
      received = payload;
    };

    syncEventInstance.on("playlist:generated", handler);
    const emitted = syncEventInstance.emit("playlist:generated", true);
    expect(emitted).toBe(true);
    expect(received).toBe(true);
  });

  test("emits dto:fetched", () => {
    syncEventInstance.removeAllListeners("dto:fetched");
    let capturedVersion = "";
    syncEventInstance.on("dto:fetched", (payload) => {
      capturedVersion = payload.meta.version;
    });

    syncEventInstance.emit("dto:fetched", minimalDto);
    expect(capturedVersion).toBe("v1");
  });
});
