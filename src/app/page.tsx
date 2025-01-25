"use client";

import { useState, useEffect, useCallback } from "react";
import { MovieResult } from "moviedb-promise";
import { tmdb, getPosterUrl } from "@/lib/tmdb";
import { Sidebar } from "@/components/layout/sidebar";
import { HeroSection } from "@/components/movies/hero-section";
import { MovieGrid } from "@/components/movies/movie-grid";
import { DebugPanel } from "@/components/dev-tools/debug-panel";
import { Search, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { debounce } from "lodash";
import { useDebugLogs } from "@/hooks/use-debug-logs";
import Image from "next/image";

export default function HomePage() {
  const { addLog } = useDebugLogs();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<MovieResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [heroMovie, setHeroMovie] = useState<MovieResult | null>(null);
  const [popularMovies, setPopularMovies] = useState<MovieResult[]>([]);
  const [actionMovies, setActionMovies] = useState<MovieResult[]>([]);
  const [thrillerMovies, setThrillerMovies] = useState<MovieResult[]>([]);

  const handleSearch = useCallback(
    debounce(async (query: string) => {
      if (!query.trim()) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      addLog(`Searching for: ${query}`);

      try {
        const response = await tmdb.searchMovie({
          query,
          include_adult: false,
          language: "en-US",
        });
        // Filter out results without posters or low vote counts
        const movies = (response.results || []).filter(
          (movie) =>
            movie.poster_path &&
            (movie.vote_count || 0) > 100 &&
            (movie.vote_average || 0) > 0
        );
        setSearchResults(movies);
        addLog(`Found ${movies.length} quality results`);
      } catch (error) {
        console.error("Search failed:", error);
        addLog(`Search failed: ${error}`, "error");
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 500),
    [addLog]
  );

  useEffect(() => {
    handleSearch(searchQuery);
    return () => {
      handleSearch.cancel();
    };
  }, [searchQuery, handleSearch]);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        addLog("Fetching movies...");
        // Fetch trending movies for hero section
        const trending = await tmdb.trending({
          media_type: "movie",
          time_window: "day",
        });
        if (trending.results?.length) {
          const randomIndex = Math.floor(
            Math.random() * trending.results.length
          );
          const randomMovie = trending.results[randomIndex];
          if (randomMovie.media_type === "movie") {
            setHeroMovie(randomMovie);
            addLog(`Set hero movie: ${randomMovie.title}`);
          }
        }

        // Fetch popular movies
        const popular = await tmdb.moviePopular();
        setPopularMovies(popular.results || []);
        addLog(`Fetched ${popular.results?.length || 0} popular movies`);

        // Fetch action movies
        const action = await tmdb.discoverMovie({
          with_genres: "28", // Action genre ID
        });
        setActionMovies(action.results || []);
        addLog(`Fetched ${action.results?.length || 0} action movies`);

        // Fetch thriller movies
        const thriller = await tmdb.discoverMovie({
          with_genres: "53", // Thriller genre ID
        });
        setThrillerMovies(thriller.results || []);
        addLog(`Fetched ${thriller.results?.length || 0} thriller movies`);
      } catch (error) {
        console.error("Failed to fetch movies:", error);
        addLog(`Error fetching movies: ${error}`, "error");
      }
    };

    fetchMovies();
  }, [addLog]);

  const handleMovieClick = (movie: MovieResult) => {
    addLog(`Selected movie: ${movie.title}`);
    // Additional functionality will be added later
  };

  return (
    <div className="relative h-screen bg-black text-white overflow-x-hidden">
      <Sidebar />

      <main className="w-full min-h-screen pl-20">
        {/* Search Bar */}
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-1/3 min-w-[300px]">
          <div className="relative group">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/70 group-focus-within:text-white transition-colors z-20">
              <Search className="w-full h-full" />
            </div>
            <Input
              placeholder="Search movies or TV shows..."
              className="w-full pl-10 bg-black/50 border-white/10 text-white placeholder:text-white/50 backdrop-blur-sm ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-white/30"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            {/* Search Results Dropdown */}
            <AnimatePresence>
              {searchQuery.trim() !== "" &&
                (isSearching || searchResults.length > 0) && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-black/95 backdrop-blur-sm border border-white/10 rounded-lg overflow-hidden shadow-2xl"
                  >
                    {isSearching ? (
                      <div className="p-6 text-center text-white/70">
                        <div className="inline-block w-6 h-6 border-2 border-white/20 border-t-white/80 rounded-full animate-spin" />
                        <p className="mt-2">Searching...</p>
                      </div>
                    ) : searchResults.length > 0 ? (
                      <div className="max-h-[70vh] overflow-y-auto">
                        {searchResults.map((movie) => (
                          <button
                            key={movie.id}
                            onClick={() => handleMovieClick(movie)}
                            className="flex items-start gap-4 w-full p-4 hover:bg-white/5 transition-colors text-left group"
                          >
                            {/* Movie Poster */}
                            <div className="relative w-16 h-24 flex-shrink-0 overflow-hidden rounded-lg">
                              <Image
                                src={getPosterUrl(movie.poster_path || null)}
                                alt={movie.title || ""}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0 py-1">
                              <h4 className="text-lg font-medium truncate group-hover:text-white transition-colors">
                                {movie.title}
                              </h4>
                              <p className="mt-1 text-sm text-white/70">
                                {new Date(
                                  movie.release_date || ""
                                ).getFullYear()}
                              </p>
                              <p className="mt-2 text-sm text-white/50 line-clamp-2">
                                {movie.overview}
                              </p>
                            </div>
                            {/* Rating Badge */}
                            <div className="flex items-center gap-1 py-1 px-2 rounded-full bg-white/10 text-yellow-500">
                              <Star className="w-4 h-4 fill-yellow-500" />
                              <span>{movie.vote_average?.toFixed(1)}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="p-6 text-center text-white/70">
                        No results found
                      </div>
                    )}
                  </motion.div>
                )}
            </AnimatePresence>
          </div>
        </div>

        <HeroSection movie={heroMovie} />

        {/* Movie Sections */}
        <div className="px-12 py-12 space-y-12">
          <MovieGrid
            title="Popular Movies"
            movies={popularMovies}
            onMovieClick={handleMovieClick}
            isLoading={popularMovies.length === 0}
          />
          <MovieGrid
            title="Action Movies"
            movies={actionMovies}
            onMovieClick={handleMovieClick}
            isLoading={actionMovies.length === 0}
          />
          <MovieGrid
            title="Thriller Movies"
            movies={thrillerMovies}
            onMovieClick={handleMovieClick}
            isLoading={thrillerMovies.length === 0}
          />
        </div>
      </main>

      <DebugPanel />
    </div>
  );
}
