import { z } from "zod";
import { mediaSchema } from "./media.schema";

export const mediaSlot = z.array(
    mediaSchema
).optional()
    .describe("List of files for the slot");
