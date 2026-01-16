import Elysia, { file, status } from "elysia";
import path from "path";

export const playlistRoute = new Elysia().get("/playlist", () => {
  const playlistPath = path.join(process.cwd(), "playlist", "playlist.json");

  if (!Bun.file(playlistPath).exists()) {
    throw status(404, "Playlist not found");
  }

  return file(playlistPath);
});
