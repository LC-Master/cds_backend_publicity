import { describe, expect, test } from "bun:test";
import { eventsRoute } from "../src/routes/events.route";

describe("eventsRoute", () => {
  test("exports a route plugin", () => {
    expect(typeof (eventsRoute as any).handle).toBe("function");
  });
});
