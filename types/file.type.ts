import { mediaStatusEnum } from "../src/enums/mediaStatus.enum";

export type IFile = {
  id: string;
  name: string;
  duration_seconds?: number;
  position?: number;
  checksum: string;
};

export type IMediaFile = Pick<IFile, "id" | "checksum"> & {
  filename: string;
  isDownloaded: boolean;
  errorCount?: number | null;
  status: mediaStatusEnum;
  localPath: string;
  updatedAt?: string | Date;
};
