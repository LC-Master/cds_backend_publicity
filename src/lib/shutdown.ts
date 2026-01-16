import { logger } from "../providers/logger.provider";
import { prisma } from "../providers/prisma";

export async function shutdown(signal: string) {
  logger.info({ signal }, "Shutting down...");
  await prisma.$disconnect();
  process.exit(0);
}