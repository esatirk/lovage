import { NextResponse } from "next/server";

interface TorrentResult {
  name: string;
  size: string;
  seeders: number;
  leechers: number;
  magnet: string;
  source: string;
  url: string;
}

async function searchPirateBay(query: string): Promise<TorrentResult[]> {
  try {
    const response = await fetch(
      `https://apibay.org/q.php?q=${encodeURIComponent(query)}&cat=0`
    );
    const data = await response.json();

    if (!Array.isArray(data) || data.length === 0 || data[0].id === "0") {
      return [];
    }

    return data.map((item) => ({
      name: item.name,
      size: formatBytes(parseInt(item.size)),
      seeders: parseInt(item.seeders),
      leechers: parseInt(item.leechers),
      magnet: `magnet:?xt=urn:btih:${item.info_hash}&dn=${encodeURIComponent(item.name)}`,
      source: "PirateBay",
      url: `https://thepiratebay.org/description.php?id=${item.id}`,
    }));
  } catch (error) {
    console.error("PirateBay search error:", error);
    return [];
  }
}

async function searchYTS(query: string): Promise<TorrentResult[]> {
  try {
    const response = await fetch(
      `https://yts.mx/api/v2/list_movies.json?query_term=${encodeURIComponent(query)}&limit=20`
    );
    const data = await response.json();

    if (!data.data?.movies) {
      return [];
    }

    const results: TorrentResult[] = [];
    data.data.movies.forEach((movie: any) => {
      movie.torrents.forEach((torrent: any) => {
        const trackers = [
          "udp://open.demonii.com:1337/announce",
          "udp://tracker.openbittorrent.com:80",
          "udp://tracker.coppersurfer.tk:6969",
          "udp://glotorrents.pw:6969/announce",
          "udp://tracker.opentrackr.org:1337/announce",
          "udp://torrent.gresille.org:80/announce",
          "udp://p4p.arenabg.com:1337",
          "udp://tracker.leechers-paradise.org:6969",
          "wss://tracker.btorrent.xyz",
          "wss://tracker.openwebtorrent.com",
        ];

        const magnetLink = `magnet:?xt=urn:btih:${torrent.hash}&dn=${encodeURIComponent(movie.title)}&tr=${trackers.map((t) => encodeURIComponent(t)).join("&tr=")}`;

        results.push({
          name: `${movie.title} [${torrent.quality}]`,
          size: torrent.size,
          seeders: torrent.seeds,
          leechers: torrent.peers,
          magnet: magnetLink,
          source: "YTS",
          url: movie.url,
        });
      });
    });

    return results;
  } catch (error) {
    console.error("YTS search error:", error);
    return [];
  }
}

function formatBytes(bytes: number): string {
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  if (bytes === 0) return "0 Bytes";
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query");
  const providers = searchParams.get("providers")?.split(",") || [
    "YTS",
    "PirateBay",
  ];

  if (!query) {
    return NextResponse.json(
      { error: "Query parameter is required" },
      { status: 400 }
    );
  }

  try {
    const searchPromises = [];

    if (providers.includes("YTS")) {
      searchPromises.push(searchYTS(query));
    }
    if (providers.includes("PirateBay")) {
      searchPromises.push(searchPirateBay(query));
    }

    const results = await Promise.all(searchPromises);
    const combinedResults = results
      .flat()
      .sort((a, b) => b.seeders - a.seeders);

    return NextResponse.json(combinedResults);
  } catch (error) {
    console.error("Search failed:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
