import { TorrentProvider, TorrentInfo, TorrentSearchOptions } from "..";

interface PirateBayTorrent {
  id: string;
  name: string;
  info_hash: string;
  leechers: string;
  seeders: string;
  num_files: number;
  size: string;
  username: string;
  added: number;
  status: string;
  category: string;
  imdb: string;
}

export class PirateBayProvider implements TorrentProvider {
  name = "The Pirate Bay";

  async search({
    query = "",
    year,
  }: TorrentSearchOptions): Promise<TorrentInfo[]> {
    const searchQuery = year ? `${query} ${year}` : query;
    // Use category 207 for HD movies
    const searchUrl = `https://apibay.org/q.php?q=${encodeURIComponent(
      searchQuery
    )}&cat=207`;

    try {
      const response = await fetch(searchUrl);
      const data = (await response.json()) as PirateBayTorrent[];

      if (!Array.isArray(data) || data.length === 0 || data[0].id === "0") {
        console.log("No results from PirateBay for query:", searchQuery);
        return [];
      }

      return data.map((item) => ({
        title: item.name,
        size: this.formatSize(parseInt(item.size)),
        seeders: parseInt(item.seeders),
        leechers: parseInt(item.leechers),
        quality: this.extractQuality(item.name),
        magnet: this.generateMagnetLink(item.info_hash, item.name),
        source: this.name,
        hash: item.info_hash,
      }));
    } catch (error) {
      console.error("Error searching The Pirate Bay:", error);
      return [];
    }
  }

  private formatSize(bytes: number): string {
    const units = ["B", "KB", "MB", "GB", "TB"];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`;
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
