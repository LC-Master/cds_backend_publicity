declare module "bun" {
    interface env {
        DATABASE_URL: string;
        API_KEY_CMS: string;
        SECRET_KEY: string;
        PORT: number;
    }
}