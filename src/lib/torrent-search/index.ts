import { YtsProvider } from "./providers/yts";
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
  query?: string;
  year?: number;
  imdbId?: string;
}

export interface TorrentProvider {
  name: string;
  search: (options: TorrentSearchOptions) => Promise<TorrentInfo[]>;
}

export async function searchTorrents({
  query,
  year,
  imdbId,
}: TorrentSearchOptions): Promise<TorrentInfo[]> {
  const providers = [
    new PirateBayProvider(),
    new YtsProvider(),
    new L337xProvider(),
    new RarbgProvider(),
  ];

  const searchPromises = providers.map((provider) =>
    provider
      .search({ query: query || "", year, imdbId })
      .then((results) => {
        const filteredResults = results.filter((result) => {
          const title = result.title.toLowerCase();
          const searchQuery = (query || "").toLowerCase();

          const queryWords = searchQuery.split(" ").filter(Boolean);
          return queryWords.every((word) => title.includes(word));
        });

        return filteredResults.map((result) => ({
          ...result,
          source: provider.name,
        }));
      })
      .catch((error) => {
        console.error(`Error searching ${provider.name}:`, error);
        return [];
      })
  );

  const results = await Promise.all(searchPromises);

  const allResults = results.flat();

  return allResults.sort((a, b) => {
    if (a.source === "The Pirate Bay" && b.source !== "The Pirate Bay")
      return -1;
    if (a.source !== "The Pirate Bay" && b.source === "The Pirate Bay")
      return 1;
    return b.seeders - a.seeders;
  });
}
