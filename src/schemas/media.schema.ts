import { z } from "zod";


export const mediaSchema = z.object({
    id: z
        .uuid()
        .describe("Unique identifier for the file"),
    name: z
        .string()
        .describe("Name of the file"),
    checksum: z
        .string()
        .regex(/^[a-f0-9]{32}$/i)
        .describe("MD5 checksum of the file"),
    duration_seconds: z
        .number()
        .describe("Duration of the file in seconds"),
    position: z
        .number()
        .describe("Position of the file in the slot"),
})
    .describe("Media file schema");
