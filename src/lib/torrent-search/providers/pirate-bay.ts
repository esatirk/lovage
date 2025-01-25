import { TorrentProvider, TorrentInfo, TorrentSearchOptions } from "..";

interface PirateBayTorrent {
  id: string;
  name: string;
  info_hash: string;
  leechers: number;
  seeders: number;
  num_files: number;
  size: number;
  username: string;
  added: number;
  status: string;
  category: number;
  imdb: string;
}

export class PirateBayProvider implements TorrentProvider {
  name = "The Pirate Bay";
  private baseUrl = "https://apibay.org";
  private corsProxies = [
    "https://api.allorigins.win/raw?url=",
    "https://api.codetabs.com/v1/proxy?quest=",
    "https://cors-anywhere.herokuapp.com/",
  ];

  private formatSize(bytes: number): string {
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    if (bytes === 0) return "0 B";
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  }

  private extractQuality(title: string): string {
    const qualities = [
      "2160p",
      "1080p",
      "720p",
      "480p",
      "HDRip",
      "BRRip",
      "DVDRip",
      "BluRay",
      "WEB-DL",
      "WEBRip",
    ];
    for (const quality of qualities) {
      if (title.toLowerCase().includes(quality.toLowerCase())) {
        return quality;
      }
    }
    return "Unknown";
  }

  private async tryProxies(url: string): Promise<Response> {
    for (const proxy of this.corsProxies) {
      try {
        const response = await fetch(proxy + encodeURIComponent(url), {
          headers: {
            "X-Requested-With": "XMLHttpRequest",
          },
        });
        if (response.ok) {
          return response;
        }
      } catch (error) {
        console.warn(`Proxy ${proxy} failed:`, error);
        continue;
      }
    }
    throw new Error("All proxies failed");
  }

  async search({ title, year }: TorrentSearchOptions): Promise<TorrentInfo[]> {
    try {
      const searchTerm = year ? `${title} ${year}` : title;
      const query = `${this.baseUrl}/q.php?q=${encodeURIComponent(searchTerm)}&cat=207`;

      const response = await this.tryProxies(query);
      const data: PirateBayTorrent[] = await response.json();

      if (!Array.isArray(data) || data.length === 0) {
        return [];
      }

      // Filter out non-movie torrents and those with no seeders
      return data
        .filter((torrent) => torrent.seeders > 0)
        .map((torrent) => ({
          title: torrent.name,
          size: this.formatSize(torrent.size),
          seeders: torrent.seeders,
          leechers: torrent.leechers,
          quality: this.extractQuality(torrent.name),
          source: this.name,
          hash: torrent.info_hash,
        }));
    } catch (error) {
      console.error("Pirate Bay search error:", error);
      return [];
    }
  }
}
