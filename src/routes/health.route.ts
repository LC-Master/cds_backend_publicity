import Elysia, { t } from "elysia";

export const healthRoute = new Elysia().get(
  "/health",
  () => {
    return {
      status: "ok",
      timeStamp: new Date().toISOString(),
      uptime: Math.round(process.uptime()),
    };
  },
  {
    response: t.Object({
      status: t.String(),
      timeStamp: t.String(),
      uptime: t.Number(),
    }),
  }
);
