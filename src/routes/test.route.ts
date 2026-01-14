import Elysia from "elysia";
import { ISnapshotDto } from "../../types/dto.type";
import { fetchDto } from "../providers/fetchDto";
import path from "node:path";
import sse from "../lib/sse";
import { syncEventInstance } from "../event/syncEvent";
import ms from "ms";

export const testRoute = new Elysia()
  .get("/dto", async () => {
    const dto = await fetchDto<ISnapshotDto>(Bun.env.CMS_ROUTE_SNAPSHOT);

    if (!dto) {
      throw new Error("Failed to fetch DTO");
    }

    Bun.write(
      path.join(process.cwd(), "Repo", "dto.json"),
      JSON.stringify(dto, null, 2)
    );
    const file = await fetch(
      `${Bun.env.CMS_MEDIA_BASE_URL}/${dto?.data.campaigns[0].slots.pm[0].id}`,
      {
        headers: {
          Authorization: `Bearer ${Bun.env.API_KEY_CMS}`,
        },
      }
    );
    await Bun.write(
      path.join(
        process.cwd(),
        "Media",
        dto?.data.campaigns[0].slots.pm[0].name || "qlq"
      ),
      file
    );
    return dto;
  })

  