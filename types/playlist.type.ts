import { z } from "zod";
import { playlistItemSchema, playlistCampaignSchema, playlistDataSchema } from "../src/schemas/playlist.schema";

export type IPlaylistItem = z.infer<typeof playlistItemSchema>;
export type IPlaylistCampaign = z.infer<typeof playlistCampaignSchema>;
export type IPlaylistData = z.infer<typeof playlistDataSchema>;
