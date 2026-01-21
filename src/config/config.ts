import { logger } from "@src/providers/logger.provider";
import { configSchema } from "@src/schemas/config.schema";
import { Env } from "bun";
import path from "path";

const APP_BASE = path.resolve(Bun.env.APP_BASE || process.cwd());

const config: Env = {
  APP_BASE,
  MEDIA_PATH: Bun.env.MEDIA_PATH || path.join(APP_BASE, "Media"),
  PLAYLIST_PATH: Bun.env.PLAYLIST_PATH || path.join(APP_BASE, "Playlist"),
  LOGS_PATH: Bun.env.LOGS_PATH || path.join(APP_BASE, "Logs"),
  VERSION: Bun.env.VERSION,
  SECRET_KEY: Bun.env.SECRET_KEY,
  API_KEY_CMS: Bun.env.API_KEY_CMS,
  CMS_BASE_URL: Bun.env.CMS_BASE_URL,
  CMS_MEDIA_BASE_URL: Bun.env.CMS_MEDIA_BASE_URL,
  CMS_ROUTE_SNAPSHOT: Bun.env.CMS_ROUTE_SNAPSHOT,
  PORT: Bun.env.PORT,
  SERVER_NEXT_PUBLIC_PRICE_CHECKER_URL:
    Bun.env.SERVER_NEXT_PUBLIC_PRICE_CHECKER_URL,
  DATABASE_URL: Bun.env.DATABASE_URL,
  DB_USER: Bun.env.DB_USER,
  DB_PASSWORD: Bun.env.DB_PASSWORD,
  DB_NAME: Bun.env.DB_NAME,
  DB_HOST: Bun.env.DB_HOST,
  DB_PORT: Bun.env.DB_PORT,
  SYNC_TTL_HOURS: Bun.env.SYNC_TTL_HOURS,
  DOWNLOAD_CONCURRENCY: Bun.env.DOWNLOAD_CONCURRENCY,
  FETCH_TIMEOUT_SECONDS: Bun.env.FETCH_TIMEOUT_SECONDS,
};

const validatedConfig = () => {
  const validatedConfig = configSchema.safeParse(config);

  if (!validatedConfig.success) {
    logger.error({
      ms: "[config] Configuración de valores de entorno no valida",
      errors: validatedConfig.error.issues,
    });
    process.exit(1);
  }
  return validatedConfig.data;
};

export const CONFIG: Env = validatedConfig();
