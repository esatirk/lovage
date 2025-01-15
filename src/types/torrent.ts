export interface TorrentMetadata {
  name: string;
  size: number;
  files: TorrentFile[];
  infoHash: string;
  magnetURI: string;
  peers: number;
  seeds: number;
  progress: number;
  downloadSpeed: number;
  uploadSpeed: number;
  timeRemaining: number;
  downloaded: number;
  uploaded: number;
  ratio: number;
}

export interface TorrentFile {
  name: string;
  path: string;
  size: number;
  progress: number;
}
