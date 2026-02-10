import { z } from "zod";
import { mediaSlot } from "./mediaSlot.schema";

export const campaign = z.object({
  id: z
    .uuid()
    .describe("Unique identifier for the campaign"),
  title: z
    .string()
    .describe("Title of the campaign"),
  department: z
    .string()
    .describe("Department associated with the campaign"),
  agreements: z
    .array(z.string())
    .optional()
    .describe("List of agreements associated with the campaign"),
  start_at: z
    .coerce
    .date()
    .describe("Start date of the campaign"),
  end_at: z
    .coerce
    .date()
    .describe("End date of the campaign"),
  slots: z.object({
    am: mediaSlot,
    pm: mediaSlot,
  }),
})