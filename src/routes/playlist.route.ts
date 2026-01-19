import Elysia, { file, status, t } from "elysia";
import path from "path";

export const playlistRoute = new Elysia().get(
  "/playlist",
  async () => {
    const playlistPath = path.join(process.cwd(), "playlist", "playlist.json");
    try {
      if (!(await Bun.file(playlistPath).exists())) {
        throw status(404, "Playlist not found");
      }

      return file(playlistPath);
    } catch (err) {
      return status(500, "Playlist not found");
    }
  },
  {
    response: {
      200: t.File({
        error: "La respuesta no es un archivo",
        description: "Archivo de la lista de reproducción",
      }),
      404: t.String({
        error: "Lista de reproducción no encontrada",
        description: "Lista de reproducción no encontrada",
      }),
      500: t.String({
        error: "Error interno del servidor",
        description: "Error al obtener la lista de reproducción",
      }),
    },
    detail: {
      summary: "Get Playlist",
      description: "Endpoint para obtener el archivo de lista de reproducción.",
      tags: ["Playlist"],
    },
  }
);
