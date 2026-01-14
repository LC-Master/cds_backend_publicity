declare module "bun" {
  interface Env {
    DATABASE_URL: string;
    API_KEY_CMS: string;
    SECRET_KEY: string;
    PORT: number;
    CMS_MEDIA_BASE_URL: string;
    CMS_ROUTE_SNAPSHOT: string;
    DB_USER: string;
    DB_PASSWORD: string;
    DB_NAME: string;
    SERVER_NEXT_PUBLIC_PRICE_CHECKER_URL: string;
    DB_HOST: string;
    DB_PORT: string;
  }
}
