import { TorrentProvider, TorrentInfo, TorrentSearchOptions } from "..";

export class L337xProvider implements TorrentProvider {
  name = "1337x";

  async search({
    query = "",
    year,
  }: TorrentSearchOptions): Promise<TorrentInfo[]> {
    const searchQuery = year ? `${query} ${year}` : query;
    const searchUrl = `https://1337x.to/search/${encodeURIComponent(
      searchQuery
    )}/1/`;

    try {
      const response = await fetch(searchUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        },
      });

      if (!response.ok) {
        console.error("1337x search failed:", response.statusText);
        return [];
      }

      const html = await response.text();
      const results: TorrentInfo[] = [];

      // Parse the HTML response
      const tableRows = html.match(/<tr>.*?<\/tr>/gs);
      if (!tableRows) return [];

      for (const row of tableRows) {
        const titleMatch = row.match(/href="\/torrent\/.*?">(.*?)<\/a>/);
        const seedersMatch = row.match(/<td class="coll-2.*?">(.*?)<\/td>/);
        const leechersMatch = row.match(/<td class="coll-3.*?">(.*?)<\/td>/);
        const sizeMatch = row.match(/<td class="coll-4.*?">(.*?)<\/td>/);
        const magnetMatch = row.match(/href="magnet:\?xt=urn:btih:(.*?)&/);

        if (titleMatch && seedersMatch && leechersMatch && sizeMatch) {
          const title = titleMatch[1].replace(/<\/?[^>]+(>|$)/g, "");
          const seeders = parseInt(seedersMatch[1]) || 0;
          const leechers = parseInt(leechersMatch[1]) || 0;
          const size = sizeMatch[1].replace(/<\/?[^>]+(>|$)/g, "");
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
        `Found ${results.length} results from 1337x for query:`,
        searchQuery
      );
      return results;
    } catch (error) {
      console.error("Error searching 1337x:", error);
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
