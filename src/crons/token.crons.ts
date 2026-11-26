import Elysia from "elysia";
import cron from "@elysiajs/cron";
import { prisma } from "@src/providers/prisma";
import { logger } from "@src/providers/logger.provider";

export const tokenCrons = new Elysia().use(
  cron({
    name: "Clean expired API keys every hour",
    pattern: "0 * * * *",
    run: async () => {
      try {
        const result = await prisma.apiKey.deleteMany({
          where: { expiresAt: { lte: new Date() } },
        });
        if (result.count && result.count > 0) {
          logger.info({ message: `Deleted ${result.count} expired API key(s)` });
        }
      } catch (err: any) {
        logger.error({ message: "Failed to clean expired API keys", error: err.message });
      }
    },
  })
);
