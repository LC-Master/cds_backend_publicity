import { z } from "zod";
import { dto } from "../src/schemas/dto.schema";
import { campaign } from "../src/schemas/campaign.schema";
import { mediaSchema } from "../src/schemas/media.schema";

export type ISnapshotDto = z.infer<typeof dto>;
export type Campaign = z.infer<typeof campaign>;
export type Slots = z.infer<typeof campaign>["slots"];
export type FileDto = z.infer<typeof mediaSchema>;
export type Meta = z.infer<typeof dto>["meta"];
export type Data = z.infer<typeof dto>["data"];


