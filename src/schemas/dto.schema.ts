import { z } from "zod";

export const dto = z.object({
  meta: z.object({
    version: z.string(),
    generated_at: z.coerce.date(),
  }),
  data: z.object({
    center_id: z.uuid(),
    campaigns: z.array(
      z.object({
        id: z.uuid(),
        title: z.string(),
        department: z.string(),
        agreement: z.string(),
        start_at: z.coerce.date(),
        end_at: z.coerce.date(),
        slots: z.object({
          am: z.array(
            z.object({
              id: z.uuid(),
              name: z.string(),
              checksum: z.string().regex(/^[a-f0-9]{32}$/i),
              duration_seconds: z.number(),
              position: z.number(),
            })
          ),
          pm: z.array(
            z.object({
              id: z.uuid(),
              name: z.string(),
              checksum: z.string().regex(/^[a-f0-9]{32}$/i),
              duration_seconds: z.number(),
              position: z.number(),
            })
          ),
        }),
      })
    ),
  }),
});
