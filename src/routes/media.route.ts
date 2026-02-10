/**
 * @module Media Route
 * @description
 * Sirve los archivos estáticos desde la carpeta `Media`.
 */
import staticPlugin from "@elysiajs/static";
import Elysia from "elysia";
import ms from "ms";
import path from "path";

export const mediaRoute = new Elysia().use(
  staticPlugin({
    assets: path.join(process.cwd(), "Media").toString(),
    prefix: "/media",
    maxAge: ms("1d"),

  })
);
