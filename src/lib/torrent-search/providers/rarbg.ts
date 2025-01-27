import { TorrentProvider, TorrentInfo, TorrentSearchOptions } from "..";

export class RarbgProvider implements TorrentProvider {
  name = "RARBG";

  async search({
    query = "",
    year,
  }: TorrentSearchOptions): Promise<TorrentInfo[]> {
    const searchQuery = year ? `${query} ${year}` : query;
    const searchUrl = `https://rarbg.to/torrents.php?search=${encodeURIComponent(
      searchQuery
    )}&category[]=14&category[]=48&category[]=17&category[]=44&category[]=45&category[]=47&category[]=50&category[]=51&category[]=52&category[]=42&category[]=46`;

    try {
      const response = await fetch(searchUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        },
      });

      if (!response.ok) {
        console.error("RARBG search failed:", response.statusText);
        return [];
      }

      const html = await response.text();
      const results: TorrentInfo[] = [];

      // Parse the HTML response
      const tableRows = html.match(/<tr class="lista2">.*?<\/tr>/s);
      if (!tableRows) return [];

      for (const row of tableRows) {
        const titleMatch = row.match(/title="(.*?)"/);
        const seedersMatch = row.match(
          /<td align="center" class="lista">(.*?)<\/td>/
        );
        const leechersMatch = row.match(
          /<td align="center" class="lista">(.*?)<\/td>/
        );
        const sizeMatch = row.match(
          /<td align="center" class="lista">(.*?)<\/td>/
        );
        const magnetMatch = row.match(/href="magnet:\?xt=urn:btih:(.*?)&/);

        if (titleMatch && seedersMatch && leechersMatch && sizeMatch) {
          const title = titleMatch[1];
          const seeders = parseInt(seedersMatch[1]) || 0;
          const leechers = parseInt(leechersMatch[1]) || 0;
          const size = sizeMatch[1];
          const hash = magnetMatch ? magnetMatch[1] : undefined;

          results.push({
            title,
            size,
            seeders,
            leechers,
            quality: this.extractQuality(title),
            magnet: hash ? this.generateMagnetLink(hash, title) : undefined,
            source: this.name,
            hash,
          });
        }
      }

      console.log(
        `Found ${results.length} results from RARBG for query:`,
        searchQuery
      );
      return results;
    } catch (error) {
      console.error("Error searching RARBG:", error);
      return [];
    }
  }

  private extractQuality(title: string): string {
    const qualities = [
      "4K",
      "2160p",
      "1080p",
      "720p",
      "HDRip",
      "BRRip",
      "BluRay",
      "WEB-DL",
      "HDTV",
    ];
    const found = qualities.find((q) =>
      title.toUpperCase().includes(q.toUpperCase())
    );
    return found || "Unknown";
  }

  private generateMagnetLink(hash: string, name: string): string {
    const trackers = [
      "udp://tracker.coppersurfer.tk:6969/announce",
      "udp://9.rarbg.to:2920/announce",
      "udp://tracker.opentrackr.org:1337",
      "udp://tracker.internetwarriors.net:1337/announce",
      "udp://tracker.leechers-paradise.org:6969/announce",
      "udp://tracker.pirateparty.gr:6969/announce",
      "udp://tracker.cyberia.is:6969/announce",
      "wss://tracker.btorrent.xyz",
      "wss://tracker.openwebtorrent.com",
      "wss://tracker.webtorrent.dev",
    ];

    const trackersString = trackers
      .map((tracker) => `&tr=${encodeURIComponent(tracker)}`)
      .join("");

    return `magnet:?xt=urn:btih:${hash}&dn=${encodeURIComponent(
      name
    )}${trackersString}`;
  }
}
