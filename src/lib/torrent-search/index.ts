import { YTSProvider } from "./providers/yts";
import { PirateBayProvider } from "./providers/pirate-bay";
import { L337xProvider } from "./providers/1337x";
import { RarbgProvider } from "./providers/rarbg";

export interface TorrentInfo {
  title: string;
  size: string;
  seeders: number;
  leechers: number;
  quality: string;
  source: string;
  magnet?: string;
  hash?: string;
}

export interface TorrentSearchOptions {
  title: string;
  year?: number;
  imdbId?: string;
}

export interface TorrentProvider {
  name: string;
  search: (options: TorrentSearchOptions) => Promise<TorrentInfo[]>;
}

const providers: TorrentProvider[] = [
  new YTSProvider(),
  new PirateBayProvider(),
  new L337xProvider(),
  new RarbgProvider(),
];

export async function searchTorrents(
  options: TorrentSearchOptions
): Promise<TorrentInfo[]> {
  const results = await Promise.all(
    providers.map(async (provider) => {
      try {
        const torrents = await provider.search(options);
        return torrents;
      } catch (error) {
        console.error(`Error searching ${provider.name}:`, error);
        return [];
      }
    })
  );

  return results.flat().sort((a, b) => b.seeders - a.seeders);
}
