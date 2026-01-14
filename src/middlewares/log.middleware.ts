import { Elysia } from "elysia";

export const logMiddleware = new Elysia().onRequest(({ request }) => {
  console.log(`[${new Date().toISOString()}] ${request.method} ${request.url}`);
});
