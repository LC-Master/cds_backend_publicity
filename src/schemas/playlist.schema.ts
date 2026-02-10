import { z } from "zod";

export const playlistItemSchema = z.object({
  id: z.uuid(),
  fileType: z.string(),
  start_at: z.union([z.date(), z.string()]),
  end_at: z.union([z.date(), z.string()]),
  position: z.number(),
});

export const playlistCampaignSchema = z.object({
  id: z.string(),
  am: z.array(playlistItemSchema),
  pm: z.array(playlistItemSchema),
});

export const playlistDataSchema = z.object({
  campaigns: z.array(playlistCampaignSchema),
  place_holder: z
    .object({
      id: z.string(),
      fileType: z.string(),
    })
    .nullable(),
});
