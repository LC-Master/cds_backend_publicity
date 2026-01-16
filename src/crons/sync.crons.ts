import Elysia from "elysia";
import cron from "@elysiajs/cron";
import { syncEventInstance } from "../event/syncEvent";
import { StorageService } from "../services/storage.service";
import { logger } from "../providers/logger.provider";
let isRetrying = false;
export const syncCrons = new Elysia()
  .use(
    cron({
      name: "Async task every day at 5AM",
      pattern: "0 5 * * *",
      timezone: "America/Caracas",
      run: () => {
        logger.info({
          message: "Starting daily sync at",
          time: new Date().toLocaleString(),
        });
      },
    })
  )
  .use(
    cron({
      name: "Async task every day at 12PM",
      pattern: "0 12 * * *",
      run: async () => {
        logger.info({
          message: "Starting async task at",
          time: new Date().toLocaleString(),
        });
        await new Promise((resolve) => setTimeout(resolve, 2000));
        logger.info({
          message: "Async task finished at",
          time: new Date().toLocaleString(),
        });
      },
    })
  )
  .use(
    cron({
      name: "Task every minute",
      pattern: "*/1 * * * *",
      run: async () => {
        logger.info({
          message: "Running DB cleanup task at",
          time: new Date().toLocaleString(),
        });
        syncEventInstance.emit("dto:updated", false);
      },
    })
  )
  .use(
    cron({
      name: "Retry_failed_downloads_every_hour",
      pattern: "0 * * * *",
      run: async () => {
        if (isRetrying) return;
        isRetrying = true;
        try {
          await StorageService.retryFailedDownloads();
        } finally {
          isRetrying = false;
        }
      },
    })
  );
