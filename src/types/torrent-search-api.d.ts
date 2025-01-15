declare module "torrent-search-api" {
  interface TorrentProvider {
    name: string;
    public: boolean;
  }

  interface TorrentSearchResult {
    title: string;
    time: string;
    size: string;
    magnet?: string;
    desc?: string;
    provider: string;
    seeds: number;
    peers: number;
    link?: string;
    url?: string;
  }

  interface TorrentSearchApi {
    enableProvider(provider: string): void;
    disableProvider(provider: string): void;
    enablePublicProviders(): void;
    getProviders(): TorrentProvider[];
    getActiveProviders(): TorrentProvider[];
    isProviderActive(provider: string): boolean;
    search(
      providers: string[],
      query: string,
      category?: string,
      limit?: number
    ): Promise<TorrentSearchResult[]>;
    getMagnet(torrent: TorrentSearchResult): Promise<string>;
    getTorrentBuffer(torrent: TorrentSearchResult): Promise<Buffer>;
    downloadTorrent(
      torrent: TorrentSearchResult,
      filePath: string
    ): Promise<void>;
  }

  const TorrentSearchApi: TorrentSearchApi;
  export = TorrentSearchApi;
}
