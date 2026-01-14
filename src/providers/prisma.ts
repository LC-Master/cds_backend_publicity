import { PrismaClient } from "../generated/prisma/client";
import { PrismaMssql } from "@prisma/adapter-mssql";

const { DB_NAME, DB_PASSWORD, DB_HOST, DB_PORT, DB_USER } = Bun.env;

const sqlConfig = {
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  server: DB_HOST,
  port: Number(DB_PORT),
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
};

const adapter = new PrismaMssql(sqlConfig);

export const prisma = new PrismaClient({ adapter });
