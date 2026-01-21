import { CONFIG } from "@src/config/config";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaMssql } from "@prisma/adapter-mssql";

const { DB_NAME, DB_PASSWORD, DB_HOST, DB_PORT, DB_USER } = CONFIG;

const sqlConfig = {
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  server: DB_HOST,
  port: DB_PORT,
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

export const connectDb = async () => {
  try {
    await prisma.$connect();
    return true;
  } catch (error) {
    return false;
  }
};
export const sureTableExists = async (tableName: string) => {
  const result = await prisma.$queryRaw<
    Array<{ tableExists: number }>
  >`SELECT CASE WHEN OBJECT_ID(${tableName}, 'U') IS NOT NULL THEN 1 ELSE 0 END AS tableExists;`;
  return result[0].tableExists === 1;
};
