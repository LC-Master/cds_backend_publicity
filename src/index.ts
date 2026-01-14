import { Elysia } from "elysia";
import { syncCrons } from "./crons/sync.crons";
import { healthRoute } from "./routes/health.route";
import { fetchDto } from "./providers/fetchDto";
import { ISnapshotDto } from "../types/dto.type";
import { logMiddleware } from "./middlewares/log.middleware";

const PORT = Number(Bun.env.PORT) || 3000;

const app = new Elysia({ prefix: "/api" })
  .use(logMiddleware)
  .get("/dto", () => {
    return fetchDto<ISnapshotDto>(Bun.env.CMS_ROUTE_SNAPSHOT);
  })
  .use(syncCrons)
  .use(healthRoute);

app.listen({ port: PORT }, (server) => {
  console.log(`🦊 Elysia is running at ${server.hostname}:${server.port}`);
});
