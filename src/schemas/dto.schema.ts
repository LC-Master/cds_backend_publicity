import { z } from "zod";
import { campaign } from "./campaign.schema";
import { mediaSchema } from "./media.schema";

export const dto = z
  .object({
    meta: z
      .object({
        api_version: z
          .string()
          .optional()
          .describe("API version of the snapshot"),
        version: z
          .string()
          .describe("Version of the snapshot, e.g., a timestamp or incremental number"),
        generated_at: z
          .coerce
          .date()
          .describe("Timestamp when the snapshot was generated"),
      }),
    data: z
      .object({
        store_id: z.coerce
          .number()
          .int()
          .positive()
          .describe("Unique identifier for the store"),
        place_holder: mediaSchema.optional(),
        campaigns: z.array(
          campaign
        ),
      }),
  });
