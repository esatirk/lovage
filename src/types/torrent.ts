import WebTorrent from "webtorrent";

declare module "webtorrent" {
  interface Torrent {
    on(event: "error", callback: (err: Error | string) => void): this;
    on(event: "warning", callback: (err: Error | string) => void): this;
    on(event: "infoHash", callback: () => void): this;
    on(event: "metadata", callback: () => void): this;
    on(event: "ready", callback: () => void): this;
    on(event: "download", callback: (bytes: number) => void): this;
    on(event: "upload", callback: (bytes: number) => void): this;
    on(event: "done", callback: () => void): this;
    on(event: "wire", callback: (wire: unknown) => void): this;
    on(event: string, callback: (...args: any[]) => void): this;
  }
}

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
