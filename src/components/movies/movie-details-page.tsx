"use client";

import { MovieResult } from "moviedb-promise";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { tmdb } from "@/lib/tmdb";
import { useDebugLogs } from "@/hooks/use-debug-logs";
import { TorrentInfo, searchTorrents } from "@/lib/torrent-search";
import { HeroSection } from "./movie-details/hero-section";
import { InfoSection } from "./movie-details/info-section";
import { SimilarMovies } from "./movie-details/similar-movies";

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
  const [torrents, setTorrents] = useState<TorrentInfo[]>([]);
  const [selectedQuality, setSelectedQuality] = useState<string>("1080p");
  const [isTorrentLoading, setIsTorrentLoading] = useState(false);

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

    const fetchTorrents = async () => {
      if (!movie?.title) return;

      setIsTorrentLoading(true);
      addLog(`Searching torrents for: ${movie.title}`);

      try {
        const results = await searchTorrents({
          title: movie.title,
          year: new Date(movie.release_date || "").getFullYear(),
          imdbId: details?.imdb_id,
        });

        // Group torrents by quality
        const filteredTorrents = results.filter(
          (torrent) =>
            torrent.quality &&
            ["2160p", "1080p", "720p", "480p"].some((q) =>
              torrent.quality.toLowerCase().includes(q.toLowerCase())
            )
        );

        // Sort by seeders within each quality group
        const sortedTorrents = filteredTorrents.sort(
          (a, b) => b.seeders - a.seeders
        );

        setTorrents(sortedTorrents);
        addLog(`Found ${sortedTorrents.length} torrents`);
      } catch (error) {
        console.error("Failed to fetch torrent info:", error);
        addLog(`Error fetching torrent info: ${error}`, "error");
      } finally {
        setIsTorrentLoading(false);
      }
    };

    fetchMovieDetails();
    fetchTorrents();
  }, [movie, details?.imdb_id, addLog]);

  const handlePersonClick = (id: number | undefined, name: string) => {
    if (!id) return;
    addLog(`Clicked on person: ${name} (ID: ${id})`);
    // This will be implemented later to show person's movies
  };

  if (!movie) return null;

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
            <div className="w-12 h-12 border-4 border-white/20 border-t-white/90 rounded-full animate-spin" />
          </div>
        )}

        <HeroSection
          movie={movie}
          details={details}
          onClose={onClose}
          onPlayClick={onPlayClick}
          torrents={torrents}
          selectedQuality={selectedQuality}
          isTorrentLoading={isTorrentLoading}
          onQualitySelect={setSelectedQuality}
        />

        <InfoSection
          movie={movie}
          details={details}
          onPersonClick={handlePersonClick}
        />

        <SimilarMovies
          movies={similarMovies}
          onMovieClick={onPlayClick}
          isLoading={isLoading}
        />
      </motion.div>
    </AnimatePresence>
  );
}
