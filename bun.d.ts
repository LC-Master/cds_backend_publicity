import { StringValue } from "ms";

declare module "bun" {
  interface Env {
    APP_BASE: string;
    PASETO_PRIVATE_KEY: string;
    PASETO_PUBLIC_KEY: string;
    VERSION: string;
    DATABASE_URL: string;
    API_KEY_CMS: string;
    SECRET_KEY: string;
    PORT: number;
    CMS_BASE_URL: string;
    DB_USER: string;
    DB_PASSWORD: string;
    DB_NAME: string;
    SERVER_NEXT_PUBLIC_PRICE_CHECKER_URL: string;
    DB_HOST: string;
    DB_PORT: number;
    MEDIA_PATH: string;
    PLAYLIST_PATH: string;
    LOGS_PATH: string;
    SYNC_TTL_HOURS: number;
    DOWNLOAD_CONCURRENCY: number;
    FETCH_TIMEOUT_SECONDS: number;
  }
}
declare var self: Worker;