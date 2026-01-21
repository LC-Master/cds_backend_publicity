import { Env } from "bun";
import packageJson from "../../package.json";
import path from 'path'
export const CONFIG: Env = {
  MEDIA_PATH: Bun.env.MEDIA_PATH || path.join(process.cwd(), "Media"),
  PLAYLIST_PATH: Bun.env.PLAYLIST_PATH || path.join(process.cwd(), "Playlist"),
  LOGS_PATH: Bun.env.LOGS_PATH || path.join(process.cwd(), "Logs"),
  VERSION: packageJson.version || "0.0.1",
  SECRET_KEY: Bun.env.SECRET_KEY || "default_secret_key",
  API_KEY_CMS: Bun.env.API_KEY_CMS || "default_api_key_cms",
  CMS_BASE_URL: Bun.env.CMS_BASE_URL || "http://localhost/api",
  CMS_MEDIA_BASE_URL:
    Bun.env.CMS_MEDIA_BASE_URL || "http://localhost/api/media",
  CMS_ROUTE_SNAPSHOT:
    Bun.env.CMS_ROUTE_SNAPSHOT || "http://localhost/api/centers/snapshots",
  PORT: Number(Bun.env.PORT) || 3000,

  SERVER_NEXT_PUBLIC_PRICE_CHECKER_URL:
    Bun.env.SERVER_NEXT_PUBLIC_PRICE_CHECKER_URL || "http://localhost:3001",

  DATABASE_URL:
    Bun.env.DATABASE_URL ||
    "sqlserver://localhost:1433;database=db;user=SA;password=12345;,trustServerCertificate=true;",
  DB_USER: Bun.env.DB_USER || "SA",
  DB_PASSWORD: Bun.env.DB_PASSWORD || "Sistemas01",
  DB_NAME: Bun.env.DB_NAME || "locatel_db",
  DB_HOST: Bun.env.DB_HOST || "localhost",
  DB_PORT: Bun.env.DB_PORT || "1433",

  SYNC_TTL_HOURS: Number(Bun.env.SYNC_TTL_HOURS) || 2,
  DOWNLOAD_CONCURRENCY: Number(Bun.env.DOWNLOAD_CONCURRENCY) || 10,
  FETCH_TIMEOUT_SECONDS: Bun.env.FETCH_TIMEOUT_SECONDS || "30",
};
