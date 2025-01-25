"use client";

import { MovieResult } from "moviedb-promise";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { PlayCircle, Star, Clock, ArrowLeft, Plus } from "lucide-react";
import { getBackdropUrl, getPosterUrl, tmdb } from "@/lib/tmdb";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { MovieCarousel } from "@/components/movies/movie-carousel";
import { useDebugLogs } from "@/hooks/use-debug-logs";
import { TorrentInfo, searchTorrents } from "@/lib/torrent-search";

interface MovieDetailsPageProps {
  movie: MovieResult | null;
  onClose: () => void;
  onPlayClick?: (movie: MovieResult) => void;
}

interface MovieDetails {
  runtime: number;
  genres: Array<{
    id: number | undefined;
    name: string;
  }>;
  credits: {
    crew: Array<{
      id: number | undefined;
      name: string;
      job: string;
    }>;
    cast: Array<{
      id: number | undefined;
      name: string;
      character: string;
      profile_path: string | null;
    }>;
  };
  status: string;
  imdb_id?: string;
}

export function MovieDetailsPage({
  movie,
  onClose,
  onPlayClick,
}: MovieDetailsPageProps) {
  const { addLog } = useDebugLogs();
  const [details, setDetails] = useState<MovieDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [similarMovies, setSimilarMovies] = useState<MovieResult[]>([]);
  const [torrentInfo, setTorrentInfo] = useState<TorrentInfo | null>(null);
  const [isTorrentLoading, setIsTorrentLoading] = useState(true);

  useEffect(() => {
    const fetchMovieDetails = async () => {
      if (!movie?.id) return;

      setIsLoading(true);
      addLog(`Fetching details for movie: ${movie.title}`);

      try {
        const [movieDetails, credits, similar] = await Promise.all([
          tmdb.movieInfo({ id: movie.id }),
          tmdb.movieCredits({ id: movie.id }),
          tmdb.movieSimilar({ id: movie.id }),
        ]);

        setDetails({
          runtime: movieDetails.runtime || 0,
          genres:
            movieDetails.genres?.map((genre) => ({
              id: genre.id,
              name: genre.name || "",
            })) || [],
          credits: {
            crew:
              credits.crew?.map((member) => ({
                id: member.id,
                name: member.name || "",
                job: member.job || "",
              })) || [],
            cast:
              credits.cast?.map((member) => ({
                id: member.id,
                name: member.name || "",
                character: member.character || "",
                profile_path: member.profile_path || null,
              })) || [],
          },
          status: movieDetails.status || "Unknown",
          imdb_id: movieDetails.imdb_id,
        });

        setSimilarMovies(similar.results || []);
        addLog(`Successfully fetched movie details and similar movies`);
      } catch (error) {
        console.error("Failed to fetch movie details:", error);
        addLog(`Error fetching movie details: ${error}`, "error");
      } finally {
        setIsLoading(false);
      }
    };

    const fetchTorrentInfo = async () => {
      if (!movie?.title) return;

      setIsTorrentLoading(true);
      addLog(`Searching torrents for: ${movie.title}`);

      try {
        const torrents = await searchTorrents({
          title: movie.title,
          year: new Date(movie.release_date || "").getFullYear(),
          imdbId: details?.imdb_id,
        });

        // Sort by seeders and get the best quality
        const bestTorrent = torrents.sort((a, b) => b.seeders - a.seeders)[0];

        if (bestTorrent) {
          setTorrentInfo(bestTorrent);
          addLog(`Found torrent: ${bestTorrent.title}`);
        } else {
          addLog("No torrents found", "warning");
        }
      } catch (error) {
        console.error("Failed to fetch torrent info:", error);
        addLog(`Error fetching torrent info: ${error}`, "error");
      } finally {
        setIsTorrentLoading(false);
      }
    };

    fetchMovieDetails();
    fetchTorrentInfo();
  }, [movie?.id, movie?.title, movie?.release_date, details?.imdb_id, addLog]);

  const handlePersonClick = (id: number | undefined, name: string) => {
    if (!id) return;
    addLog(`Clicked on person: ${name} (ID: ${id})`);
    // This will be implemented later to show person's movies
  };

  if (!movie) return null;

  const hours = details ? Math.floor(details.runtime / 60) : 0;
  const minutes = details ? details.runtime % 60 : 0;

  const director = details?.credits.crew.find(
    (member) => member.job === "Director"
  );

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black overflow-y-auto"
      >
        {/* Loading State */}
        {isLoading && (
          <div className="absolute inset-0 z-[110] bg-black/50 backdrop-blur-sm flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-white/20 border-t-white/90 rounded-full animate-spin" />
              <p className="text-white/70">Loading movie details...</p>
            </div>
          </div>
        )}

        {/* Hero Section */}
        <div className="relative h-[70vh]">
          {/* Background Image */}
          <Image
            src={getBackdropUrl(movie.backdrop_path || null, "original")}
            alt={movie.title || ""}
            fill
            className="object-cover"
            priority
            quality={100}
          />

          {/* Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent" />

          {/* Back Button */}
          <button
            onClick={onClose}
            className="fixed left-8 top-8 flex items-center gap-2 px-4 py-2 rounded-full bg-black/30 backdrop-blur-xl border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all z-[110]"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>

          {/* Content */}
          <div className="absolute inset-x-0 bottom-0 container mx-auto px-8 pb-12">
            <div className="flex gap-8">
              {/* Poster */}
              <div className="relative w-[300px] aspect-[2/3] rounded-xl overflow-hidden shadow-2xl">
                <Image
                  src={getPosterUrl(movie.poster_path || null)}
                  alt={movie.title || ""}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Info */}
              <div className="flex-1 pt-12">
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-xl border border-white/10">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm font-medium text-yellow-500">
                      {movie.vote_average?.toFixed(1)}
                    </span>
                  </div>
                  {details && (
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-xl border border-white/10">
                      <Clock className="w-4 h-4 text-white/70" />
                      <span className="text-sm font-medium text-white/90">
                        {hours}h {minutes}m
                      </span>
                    </div>
                  )}
                  <div className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-xl border border-white/10">
                    <span className="text-sm font-medium text-white/90">
                      {new Date(movie.release_date || "").getFullYear()}
                    </span>
                  </div>
                </div>

                <h1 className="text-5xl font-bold mb-4">{movie.title}</h1>
                <p className="text-xl text-white/80 mb-8 max-w-3xl">
                  {movie.overview}
                </p>

                {/* Stream Info */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4 mb-8">
                  {isTorrentLoading ? (
                    <div className="flex items-center justify-center h-20">
                      <div className="w-6 h-6 border-2 border-white/20 border-t-white/80 rounded-full animate-spin" />
                    </div>
                  ) : torrentInfo ? (
                    <div className="grid grid-cols-4 gap-4">
                      <div>
                        <div className="text-sm text-white/60 mb-1">
                          Quality
                        </div>
                        <div className="font-medium">{torrentInfo.quality}</div>
                      </div>
                      <div>
                        <div className="text-sm text-white/60 mb-1">Size</div>
                        <div className="font-medium">{torrentInfo.size}</div>
                      </div>
                      <div>
                        <div className="text-sm text-white/60 mb-1">
                          Seeders
                        </div>
                        <div className="font-medium text-green-500">
                          {torrentInfo.seeders}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-white/60 mb-1">
                          Leechers
                        </div>
                        <div className="font-medium text-yellow-500">
                          {torrentInfo.leechers}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-white/60 py-4">
                      No torrent found
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  <Button
                    size="lg"
                    onClick={() => onPlayClick?.(movie)}
                    className="gap-2 bg-white text-black hover:bg-white/90 transition-colors"
                    disabled={!torrentInfo}
                  >
                    <PlayCircle className="w-5 h-5" />
                    Stream Now
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="gap-2 bg-white/10 backdrop-blur-xl border-white/10 hover:bg-white/20"
                  >
                    <Plus className="w-5 h-5" />
                    Add to List
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Movie Info */}
        <div className="container mx-auto px-8 py-12">
          {/* Basic Info */}
          <div className="mb-12">
            {details?.genres && (
              <div className="flex flex-wrap gap-2 mb-6">
                {details.genres.map((genre) => (
                  <span
                    key={genre.id}
                    className="px-3 py-1 rounded-full bg-white/10 text-sm font-medium"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>
            )}

            <div className="space-y-4">
              {director && (
                <div className="text-white/70">
                  Directed by{" "}
                  <button
                    onClick={() =>
                      handlePersonClick(director.id, director.name)
                    }
                    className="text-white font-medium hover:text-primary transition-colors"
                  >
                    {director.name}
                  </button>
                </div>
              )}

              {details?.credits.cast && details.credits.cast.length > 0 && (
                <div className="text-white/70">
                  Starring{" "}
                  {details.credits.cast
                    .slice(0, 4)
                    .map((actor) => (
                      <button
                        key={actor.id}
                        onClick={() => handlePersonClick(actor.id, actor.name)}
                        className="text-white font-medium hover:text-primary transition-colors"
                      >
                        {actor.name}
                      </button>
                    ))
                    .reduce((prev, curr) => (
                      <>
                        {prev}, {curr}
                      </>
                    ))}
                </div>
              )}
            </div>
          </div>

          {/* Similar Movies */}
          {similarMovies.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Similar Movies</h2>
              <MovieCarousel
                movies={similarMovies}
                onMovieClick={onPlayClick}
                isLoading={isLoading}
                title="Similar Movies"
              />
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
