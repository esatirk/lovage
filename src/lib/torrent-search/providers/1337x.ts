import { TorrentProvider, TorrentInfo, TorrentSearchOptions } from "..";

interface L337xTorrent {
  name: string;
  size: string;
  seeds: number;
  leeches: number;
  time: string;
  uploader: string;
}

export class L337xProvider implements TorrentProvider {
  name = "1337x";
  private baseUrl = "https://1337x.to";
  private corsProxies = [
    "https://api.allorigins.win/raw?url=",
    "https://api.codetabs.com/v1/proxy?quest=",
    "https://cors-anywhere.herokuapp.com/",
  ];

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
      const query = `${this.baseUrl}/search/${encodeURIComponent(searchTerm)}/1/`;

      const response = await this.tryProxies(query);
      const html = await response.text();

      // Parse the HTML to extract torrent information
      const torrents: TorrentInfo[] = [];
      const rows = html.match(/<tr>.*?<\/tr>/gs);

      if (!rows) return [];

      for (const row of rows) {
        const nameMatch = row.match(/href="\/torrent\/.*?">(.*?)<\/a>/);
        const seedsMatch = row.match(/<td class="seeds">(.*?)<\/td>/);
        const leechesMatch = row.match(/<td class="leeches">(.*?)<\/td>/);
        const sizeMatch = row.match(/<td class="size">(.*?)<\/td>/);

        if (nameMatch && seedsMatch && leechesMatch && sizeMatch) {
          const title = nameMatch[1].replace(/<[^>]*>/g, "");
          const seeds = parseInt(seedsMatch[1]);
          const leeches = parseInt(leechesMatch[1]);
          const size = sizeMatch[1].replace(/<[^>]*>/g, "").trim();

          if (seeds > 0) {
            torrents.push({
              title,
              size,
              seeders: seeds,
              leechers: leeches,
              quality: this.extractQuality(title),
              source: this.name,
            });
          }
        }
      }

      return torrents;
    } catch (error) {
      console.error("1337x search error:", error);
      return [];
    }
  }
}
