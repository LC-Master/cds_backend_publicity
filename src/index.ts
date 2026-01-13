import { Elysia } from "elysia";
import { syncCrons } from "./crons/sync.crons";
import { healthRoute } from "./routes/health.route";

const PORT = Number(Bun.env.PORT) || 3000;

const app = new Elysia({ prefix: "/api" })
  .get("/", () => "Hello Elysia")
  .use(syncCrons)
  .use(healthRoute);

app.listen({ port: PORT }, (server) => {
  console.log(`🦊 Elysia is running at ${server.hostname}:${server.port}`);
});
