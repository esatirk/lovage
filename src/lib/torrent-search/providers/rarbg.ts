import { TorrentProvider, TorrentInfo, TorrentSearchOptions } from "..";

interface RarbgTorrent {
  title: string;
  category: string;
  download: string;
  seeders: number;
  leechers: number;
  size: string;
  pubdate: string;
}

export class RarbgProvider implements TorrentProvider {
  name = "RARBG";
  private baseUrl = "https://rargb.to";
  private corsProxies = [
    "https://api.allorigins.win/raw?url=",
    "https://api.codetabs.com/v1/proxy?quest=",
    "https://cors.sh/?",
    "https://corsproxy.io/?",
    "https://proxy.cors.sh/",
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
      const query = `${this.baseUrl}/search/${encodeURIComponent(searchTerm)}`;

      const response = await this.tryProxies(query);
      const html = await response.text();

      // Parse the HTML to extract torrent information
      const torrents: TorrentInfo[] = [];
      const rows = html.match(/<tr class="lista2">.*?<\/tr>/g);

      if (!rows) return [];

      for (const row of rows) {
        const titleMatch = row.match(/<a href="[^"]*" title="([^"]*)"/);
        const seedsMatch = row.match(
          /<font color="green"><b>(\d+)<\/b><\/font>/
        );
        const leechesMatch = row.match(
          /<font color="red"><b>(\d+)<\/b><\/font>/
        );
        const sizeMatch = row.match(
          /<td align="center" width="100px">(.*?)<\/td>/
        );

        if (titleMatch && seedsMatch && leechesMatch && sizeMatch) {
          const title = titleMatch[1];
          const seeds = parseInt(seedsMatch[1]);
          const leeches = parseInt(leechesMatch[1]);
          const size = sizeMatch[1].trim();

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
      console.error("RARBG search error:", error);
      return [];
    }
  }
}
