"use client";

import { MovieResult } from "moviedb-promise";
import Image from "next/image";
import { Star } from "lucide-react";
import { motion } from "framer-motion";
import { getPosterUrl } from "@/lib/tmdb";

interface TopMoviesProps {
  movies: MovieResult[];
  onMovieClick?: (movie: MovieResult) => void;
  isLoading?: boolean;
}

export function TopMovies({
  movies,
  onMovieClick,
  isLoading = false,
}: TopMoviesProps) {
  if (isLoading) {
    return (
      <section className="relative">
        <h2 className="text-2xl font-bold mb-6">Today's Top 10</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, index) => (
            <div key={index} className="relative">
              <div className="aspect-[2/3] rounded-lg bg-white/5 animate-pulse" />
              <div className="absolute -left-4 -top-4 w-8 h-8 bg-white/5 rounded-full animate-pulse" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="relative">
      <h2 className="text-2xl font-bold mb-6">Today's Top 10</h2>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {movies.slice(0, 10).map((movie, index) => (
          <motion.button
            key={movie.id}
            whileHover={{ scale: 1.05 }}
            className="relative"
            onClick={() => onMovieClick?.(movie)}
          >
            {/* Rank Badge */}
            <div className="absolute -left-4 -top-4 w-8 h-8 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center z-10">
              <span className="text-lg font-bold">{index + 1}</span>
            </div>

            {/* Movie Card */}
            <div className="relative aspect-[2/3] rounded-lg overflow-hidden group">
              <Image
                src={getPosterUrl(movie.poster_path || null)}
                alt={movie.title || ""}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute bottom-0 left-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <h3 className="font-semibold truncate text-white">
                  {movie.title}
                </h3>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-yellow-500" />
                    <span className="text-sm font-medium text-yellow-500">
                      {movie.vote_average?.toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </section>
  );
}
