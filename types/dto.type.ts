import { IFile } from "./file.type";

export interface ISnapshotDto {
  meta: Meta;
  data: Data;
}

export interface Meta {
  api_version?: string;
  version: string;
  generated_at: Date;
}

export interface Data {
  store_id: number;
  place_holder?: IFile;
  campaigns: Campaign[];
}

export interface Campaign {
  id: string;
  title: string;
  department: string;
  agreements?: string[];
  start_at: Date;
  end_at: Date;
  slots: Slots;
}

export interface Slots {
  am: FileDto[];
  pm: FileDto[];
}

export interface FileDto {
  id: string;
  name: string;
  duration_seconds: number;
  checksum: string;
  position: number;
}

