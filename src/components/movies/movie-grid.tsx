"use client";

import { MovieResult } from "moviedb-promise";
import Image from "next/image";
import { Star } from "lucide-react";
import { motion } from "framer-motion";
import { getPosterUrl } from "@/lib/tmdb";

interface MovieGridProps {
  title: string;
  movies: MovieResult[];
  onMovieClick?: (movie: MovieResult) => void;
  isLoading?: boolean;
}

export function MovieGrid({
  title,
  movies,
  onMovieClick,
  isLoading = false,
}: MovieGridProps) {
  return (
    <section>
      <h2 className="text-2xl font-bold mb-6">{title}</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {isLoading
          ? Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="aspect-[2/3] rounded-lg bg-white/5 animate-pulse"
              />
            ))
          : movies.slice(0, 6).map((movie) => (
              <motion.button
                key={movie.id}
                whileHover={{ scale: 1.05 }}
                className="relative aspect-[2/3] rounded-lg overflow-hidden group"
                onClick={() => onMovieClick?.(movie)}
              >
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
              </motion.button>
            ))}
      </div>
    </section>
  );
}
