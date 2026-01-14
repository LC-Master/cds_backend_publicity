import { Elysia } from "elysia";
import { syncCrons } from "./crons/sync.crons";
import { healthRoute } from "./routes/health.route";
import { logMiddleware } from "./middlewares/log.middleware";
import { testRoute } from "./routes/test.route";
import cors from "@elysiajs/cors";

const PORT = Number(Bun.env.PORT) || 3000;

const app = new Elysia({ prefix: "/api" })
  .use(
    cors({
      origin: "*",
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    })
  )
  .use(logMiddleware)
  .use(testRoute)
  .use(syncCrons)
  .use(healthRoute);

app.listen({ port: PORT }, (server) => {
  console.log(`🦊 Elysia is running at ${server.hostname}:${server.port}`);
});

export default app;
