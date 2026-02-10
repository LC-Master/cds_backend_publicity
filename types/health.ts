import { IHealthResponse } from "@src/schemas/health.schema";
import { IFile } from "./file.type";

export type IHealth = Omit<IHealthResponse, "mediaError"> & {
    mediaError: IFile[] | null;
};