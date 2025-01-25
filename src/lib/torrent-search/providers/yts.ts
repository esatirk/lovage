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

export class YTSProvider implements TorrentProvider {
  name = "YTS";
  private baseUrl = "https://yts.mx/api/v2";

  async search({
    title,
    year,
    imdbId,
  }: TorrentSearchOptions): Promise<TorrentInfo[]> {
    try {
      let query = `${this.baseUrl}/list_movies.json?query_term=${encodeURIComponent(
        imdbId || title
      )}`;

      if (year) {
        query += `&year=${year}`;
      }

      const response = await fetch(query);
      const data: YTSResponse = await response.json();

      if (data.status !== "ok" || !data.data.movies) {
        return [];
      }

      return data.data.movies.flatMap((movie) =>
        movie.torrents.map((torrent) => ({
          title: `${movie.title} (${movie.year}) ${torrent.quality} ${torrent.type}`,
          size: torrent.size,
          seeders: torrent.seeds,
          leechers: torrent.peers,
          quality: torrent.quality,
          source: this.name,
          hash: torrent.hash,
        }))
      );
    } catch (error) {
      console.error("YTS search error:", error);
      return [];
    }
  }
}
