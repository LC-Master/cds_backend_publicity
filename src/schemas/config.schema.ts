import path from "path";
import z from "zod";

export const configSchema = z.object({
  APP_BASE: z
    .string({
      error: "APP_BASE es obligatorio y tiene que ser una cadena de texto",
    })
    .min(1, "APP_BASE: demasiado corto")
    .describe("Directorio base de la aplicación")
    .transform((val) => path.resolve(val)),

  MEDIA_PATH: z
    .string({
      error: "MEDIA_PATH es obligatorio y tiene que ser una cadena de texto",
    })
    .min(1, "MEDIA_PATH: demasiado corto")
    .describe("Directorio donde se almacenan los archivos multimedia")
    .default("Media")
    .transform((val) => path.resolve(val)),

  PLAYLIST_PATH: z
    .string({
      error: "PLAYLIST_PATH es obligatorio y tiene que ser una cadena de texto",
    })
    .min(1, "PLAYLIST_PATH: demasiado corto")
    .default("Playlist")
    .describe(
      "Directorio donde se almacenan los archivos de lista de reproducción"
    )
    .transform((val) => path.resolve(val)),

  LOGS_PATH: z
    .string({
      error: "LOGS_PATH es obligatorio y tiene que ser una cadena de texto",
    })
    .min(1, "LOGS_PATH: demasiado corto")
    .default("Logs")
    .describe("Directorio donde se almacenan los archivos de logs")
    .transform((val) => path.resolve(val)),

  VERSION: z
    .string({
      error: "VERSION es obligatorio y tiene que ser una cadena de texto",
    })
    .regex(
      /^\d+\.\d+\.\d+(-[\w.-]+)?$/,
      "VERSION debe ser semántica, p. ej. 1.2.3"
    )
    .describe("Versión de la aplicación")
    .default("0.0.0.1"),

  SECRET_KEY: z
    .string({
      error: "SECRET_KEY es obligatoria y tiene que ser una cadena de texto",
    })
    .min(8, "SECRET_KEY debe tener al menos 8 caracteres")
    .describe("Clave secreta para la aplicación"),

  API_KEY_CMS: z
    .string({
      error: "API_KEY_CMS es obligatoria y tiene que ser una cadena de texto",
    })
    .min(8, "API_KEY_CMS debe tener al menos 8 caracteres")
    .describe("Clave API para autenticación con el CMS"),

  CMS_BASE_URL: z
    .url({ error: "CMS_BASE_URL debe ser una URL válida" })
    .describe("URL base del CMS"),

  CMS_MEDIA_BASE_URL: z
    .url({
      error: "CMS_MEDIA_BASE_URL debe ser una URL válida",
    })
    .describe("URL base para descargar medios del CMS"),

  CMS_ROUTE_SNAPSHOT: z
    .url({
      error: "CMS_ROUTE_SNAPSHOT debe ser una URL válida",
    })
    .describe("URL para la instantánea de rutas del CMS"),

  PORT: z.coerce
    .number()
    .int("PORT debe ser un entero")
    .min(1, "PORT debe ser mayor o igual a 1")
    .max(65535, "PORT debe ser menor o igual a 65535")
    .describe("Puerto en el que corre el servidor")
    .default(3000),

  SERVER_NEXT_PUBLIC_PRICE_CHECKER_URL: z
    .url({
      error: "SERVER_NEXT_PUBLIC_PRICE_CHECKER_URL debe ser una URL válida",
    })
    .describe("URL pública del verificador de precios del servidor"),

  DATABASE_URL: z
    .string({
      error: "DATABASE_URL es obligatoria y tiene que ser una cadena de texto",
    })
    .min(1, "DATABASE_URL no puede estar vacío")
    .describe("URL de la base de datos"),

  DB_USER: z
    .string({
      error: "DB_USER es obligatorio y tiene que ser una cadena de texto",
    })
    .min(1, "DB_USER no puede estar vacío")
    .describe("Usuario de la base de datos"),

  DB_PASSWORD: z
    .string({
      error: "DB_PASSWORD es obligatoria y tiene que ser una cadena de texto",
    })
    .min(8, "DB_PASSWORD debe tener al menos 8 caracteres")
    .describe("Contraseña de la base de datos"),

  DB_NAME: z
    .string({
      error: "DB_NAME es obligatorio y tiene que ser una cadena de texto",
    })
    .min(1, "DB_NAME no puede estar vacío")
    .describe("Nombre de la base de datos"),

  DB_HOST: z
    .string({
      error: "DB_HOST es obligatorio y tiene que ser una cadena de texto",
    })
    .min(1, "DB_HOST no puede estar vacío")
    .describe("Host de la base de datos"),

  DB_PORT: z.coerce
    .number()
    .int("DB_PORT debe ser un entero")
    .min(1, "DB_PORT debe ser mayor o igual a 1")
    .max(65535, "DB_PORT debe ser menor o igual a 65535")
    .describe("Puerto de la base de datos")
    .default(1433),

  SYNC_TTL_HOURS: z.coerce
    .number()
    .int("SYNC_TTL_HOURS debe ser un entero")
    .min(1, "SYNC_TTL_HOURS debe ser al menos 1")
    .max(168, "SYNC_TTL_HOURS no debe superar 168 horas")
    .describe(
      "Tiempo en horas para considerar una sincronización como obsoleta"
    )
    .default(2),

  DOWNLOAD_CONCURRENCY: z.coerce
    .number()
    .int("DOWNLOAD_CONCURRENCY debe ser un entero")
    .min(1, "DOWNLOAD_CONCURRENCY debe ser al menos 1")
    .max(100, "DOWNLOAD_CONCURRENCY no debe superar 100")
    .describe("Número de descargas concurrentes permitidas")
    .default(10),

  FETCH_TIMEOUT_SECONDS: z.coerce
    .number()
    .int("FETCH_TIMEOUT_SECONDS debe ser un entero")
    .min(5, "FETCH_TIMEOUT_SECONDS debe ser al menos 5")
    .max(300, "FETCH_TIMEOUT_SECONDS no debe superar 300")
    .describe(
      "Tiempo en segundos antes de que una solicitud fetch agote el tiempo de espera"
    )
    .default(30),
});