import Elysia from "elysia";
import { SyncService } from "../services/sync.service";

export const testRoute = new Elysia()
  .get("/dto", async () => {
    const dto = await SyncService.syncData();
    return dto;
  })
