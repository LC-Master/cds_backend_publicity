import z from "zod";
import { IFile } from "../../types/file.type";
import { healthEnum } from "@src/enums/health.enum";
import { mediaSchema } from "./media.schema";

export const healthSchema = z.object({
    disk: z.object({
        size: z.number(),
        free: z.number(),
        used: z.number(),
    }),
    start_at: z
        .date()
        .nullable()
        .transform((d) => d ? d.toISOString() : null)
        .describe('sync start timestamp'),

    end_at: z
        .date()
        .nullable()
        .transform((d) => d ? d.toISOString() : null)
        .describe('sync end timestamp'),
    syncState: z.enum(healthEnum),
    dtoChanged: z.boolean(),
    uptime: z.number(),
    mediaCount: z.number(),
    communicationKey: z
        .string()
        .nullable()
        .describe('optional field for future use, can be used to verify communication with CMS'),
    mediaError: z.array(
        mediaSchema.pick({
            id: true,
            name: true,
            checksum: true,
        }).extend({
            errorCount: z
                .number()
                .describe('number of errors encountered'),
            errorType: z
                .string()
                .describe('type of error encountered'),
            lastErrorAt: z
                .coerce
                .date()
                .nullable()
                .describe('timestamp of the last error encountered'),
        })
    ).nullable(),
    reported_at: z
        .date()
        .transform((d) => d.toISOString())
        .describe('last reported timestamp'),
});

export type IHealthInput = z.input<typeof healthSchema>;

export type IHealthOutput = z.output<typeof healthSchema>;

export type IHealth = Omit<IHealthInput, "mediaError"> & {
    mediaError: IFile[] | null;
};