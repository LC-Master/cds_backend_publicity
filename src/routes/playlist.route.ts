import staticPlugin from "@elysiajs/static";
import Elysia from "elysia";
import path from "path";

export const playlistRoute = new Elysia().use(
  staticPlugin({
    assets: path.join(process.cwd(), "playlist"),
    prefix: "/playlist",
  })
);
