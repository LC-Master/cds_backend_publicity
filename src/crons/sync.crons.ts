import Elysia from "elysia";
import cron from "@elysiajs/cron";
import { prisma } from "../providers/prisma";
import { syncEventInstance } from "../event/syncEvent";

export const syncCrons = new Elysia()
  .use(
    cron({
      name: "Async task every day at 5AM",
      pattern: "0 5 * * *",
      timezone: "America/Caracas",
      run: () => {
        console.log("Task executed at", new Date().toLocaleString());
      },
    })
  )
  .use(
    cron({
      name: "Async task every day at 12PM",
      pattern: "0 12 * * *",
      run: async () => {
        console.log("Async task started at", new Date().toLocaleString());
        await new Promise((resolve) => setTimeout(resolve, 2000));
        console.log("Async task finished at", new Date().toLocaleString());
      },
    })
  )
  .use(
    cron({
      name: "Task every minute",
      pattern: "*/1 * * * *",
      run: async () => {
        console.log("Running DB cleanup task at", new Date().toLocaleString());
        syncEventInstance.emit("dto:updated", false);
      },
    })
  );
