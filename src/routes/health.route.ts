import Elysia from "elysia";

export const healthRoute = new Elysia().get("/health", () => {
  return {
    status: "ok",
    timeStamp: new Date().toISOString(),
    uptime: Math.round(process.uptime()),
  };
});
