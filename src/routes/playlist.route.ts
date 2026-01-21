/**
 * @module Playlist Route
 * @description
 * Rutas relacionadas con la obtención del archivo `playlist.json`.
 */
import { CONFIG } from "@src/config/config";
import { logger } from "@src/providers/logger.provider";
import { Unauthorized } from "@src/schemas/Unauthorized.schema";
import Elysia, { file, t } from "elysia";
import path from "path";

/**
 * Endpoint para servir el archivo `playlist.json` mediante Elysia.
 * Devuelve 404 si el archivo no existe.
 */
export const playlistRoute = new Elysia({
  detail: {
    parameters: [
      {
        name: "Authorization",
        in: "header",
        required: true,
        schema: { type: "string", example: "Bearer your_token_here" },
        description: "Token de acceso JWT",
      },
    ],
  },
}).get(
  "/playlist",
  async ({ status }) => {
    const playlistPath = path.join(CONFIG.PLAYLIST_PATH, "playlist.json");
    try {
      if (!(await Bun.file(playlistPath).exists())) {
        logger.warn({
          message: "Playlist file not found",
        });
        return status(404, { error: "Playlist not found" });
      }
      return file(playlistPath);
    } catch (err) {
      logger.error({
        err,
        message: "Error retrieving playlist",
      });
      return status(500, { error: "Server error retrieving playlist" });
    }
  },
  {
    response: {
      200: t.File({
        error: "La respuesta no es un archivo",
        description: "Archivo de la lista de reproducción",
      }),
      401: Unauthorized,
      404: t.Object(
        {
          error: t.String({
            error: "Lista de reproducción no encontrada",
            examples: ["Playlist not found"],
            description:
              "Mensaje de error cuando la lista de reproducción no se encuentra",
          }),
        },
        {
          title: "Playlist Not Found",
          examples: [{ error: "Playlist not found" }],
          description:
            "Error cuando no se encuentra el archivo de la lista de reproducción",
        }
      ),
      500: t.Object(
        {
          error: t.String({
            error: "Error interno del servidor",
            examples: ["Server error retrieving playlist"],
            description:
              "Mensaje de error cuando hay un problema al obtener la lista de reproducción",
          }),
        },
        {
          title: "Internal Server Error",
          description: "Error interno al obtener la lista de reproducción",
          examples: [{ error: "Server error retrieving playlist" }],
        }
      ),
    },
    detail: {
      summary: "Get Playlist",
      description: "Endpoint para obtener el archivo de lista de reproducción.",
      tags: ["Playlist"],
    },
  }
);
