import jwt from "@elysiajs/jwt";
import { CONFIG } from "@src/config/config";
import Elysia from "elysia";

export const auth = new Elysia().use(
  jwt({
    name: "jwt",
    secret: CONFIG.SECRET_KEY,
  })
);