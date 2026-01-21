export interface ISnapshotDto {
  meta: Meta;
  data: Data;
}

export interface Meta {
  version: string;
  generated_at: Date;
}

export interface Data {
  center_id: string;
  campaigns: Campaign[];
}

export interface Campaign {
  id: string;
  title: string;
  department: string;
  agreement: string;
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

