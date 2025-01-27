import { TorrentProvider, TorrentInfo, TorrentSearchOptions } from "..";

interface YTSMovie {
  id: number;
  url: string;
  imdb_code: string;
  title: string;
  title_english: string;
  title_long: string;
  year: number;
  rating: number;
  runtime: number;
  genres: string[];
  download_count: number;
  like_count: number;
  description_intro: string;
  torrents: Array<{
    url: string;
    hash: string;
    quality: string;
    type: string;
    seeds: number;
    peers: number;
    size: string;
    size_bytes: number;
    date_uploaded: string;
    date_uploaded_unix: number;
  }>;
}

interface YTSResponse {
  status: string;
  status_message: string;
  data: {
    movie_count: number;
    limit: number;
    page_number: number;
    movies: YTSMovie[];
  };
}

export class YtsProvider implements TorrentProvider {
  name = "YTS";

  async search({
    query = "",
    year,
  }: TorrentSearchOptions): Promise<TorrentInfo[]> {
    const searchUrl = `https://yts.mx/api/v2/list_movies.json?query_term=${encodeURIComponent(
      query
    )}${year ? `&year=${year}` : ""}`;

    try {
      const response = await fetch(searchUrl);
      const data = (await response.json()) as YTSResponse;

      if (data.status !== "ok" || !data.data.movies) {
        return [];
      }

      return data.data.movies.flatMap((movie: YTSMovie) =>
        movie.torrents.map((torrent) => ({
          title: `${movie.title} ${movie.year} ${torrent.quality}`,
          size: torrent.size,
          seeders: torrent.seeds,
          leechers: torrent.peers,
          quality: torrent.quality,
          magnet: this.generateMagnetLink(torrent.hash, movie.title),
          source: this.name,
        }))
      );
    } catch (error) {
      console.error("Error searching YTS:", error);
      return [];
    }
  }

  private generateMagnetLink(hash: string, title: string): string {
    const trackers = [
      "udp://open.demonii.com:1337/announce",
      "udp://tracker.openbittorrent.com:80",
      "udp://tracker.coppersurfer.tk:6969",
      "udp://glotorrents.pw:6969/announce",
      "udp://tracker.opentrackr.org:1337/announce",
      "udp://torrent.gresille.org:80/announce",
      "udp://p4p.arenabg.com:1337",
      "udp://tracker.leechers-paradise.org:6969",
    ];

    const trackersString = trackers
      .map((tracker) => `&tr=${encodeURIComponent(tracker)}`)
      .join("");

    return `magnet:?xt=urn:btih:${hash}&dn=${encodeURIComponent(
      title
    )}${trackersString}`;
  }
}
