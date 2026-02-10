export interface IPlaylistItem {
  id: string;
  fileType: string;
  start_at: Date | string;
  end_at: Date | string;
  position: number;
}

export interface IPlaylistCampaign {
  id: string;
  am: IPlaylistItem[];
  pm: IPlaylistItem[];
}

export interface IPlaylistData {
  campaigns: IPlaylistCampaign[];
  place_holder: {
    id: string;
    fileType: string;
  } | null;
}
