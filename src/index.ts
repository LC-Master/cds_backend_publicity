import { Elysia } from "elysia";
import { syncCrons } from "./crons/sync.crons";
import { healthRoute } from "./routes/health.route";
import { logMiddleware } from "./middlewares/log.middleware";
import { testRoute } from "./routes/test.route";
import cors from "@elysiajs/cors";
import { eventsRoute } from "./routes/events.route";
import { mediaRoute } from "./routes/media.route";
import path from "path/win32";
import { StorageService } from "./services/storage.service";

const PORT = Number(Bun.env.PORT) || 3000;

const app = new Elysia({ prefix: "/api" })
  .use(
    cors({
      origin: Bun.env.SERVER_NEXT_PUBLIC_PRICE_CHECKER_URL,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    })
  )
  .use(logMiddleware)
  .use(mediaRoute)
  .use(eventsRoute)
  .use(testRoute)
  .use(syncCrons)
  .use(healthRoute);

app.listen({ port: PORT }, async (server) => {
  await StorageService.createLogDirIfNotExists();
  console.log(`🦊 Elysia is running at ${server.hostname}:${server.port}`);
});

export default app;
