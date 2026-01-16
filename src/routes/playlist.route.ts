import Elysia, { file, status } from "elysia";
import path from "path";

export const playlistRoute = new Elysia().get("/playlist", async () => {
  const playlistPath = path.join(process.cwd(), "playlist", "playlist.json");

  if (! await Bun.file(playlistPath).exists()) {
    throw status(404, "Playlist not found");
  }

  return file(playlistPath);
});
