"use client";

import { MovieResult } from "moviedb-promise";
import Image from "next/image";
import { Star, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { getBackdropUrl, getPosterUrl } from "@/lib/tmdb";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface MovieCardProps {
  movie: MovieResult;
  onMovieClick?: (movie: MovieResult) => void;
  rank?: number;
  className?: string;
  runtime?: number;
  onHoverStart?: () => void;
  onHoverEnd?: () => void;
}

export function MovieCard({
  movie,
  onMovieClick,
  rank,
  className,
  runtime,
  onHoverStart,
  onHoverEnd,
}: MovieCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const hours = runtime ? Math.floor(runtime / 60) : 0;
  const minutes = runtime ? runtime % 60 : 0;

  const handleHoverStart = () => {
    setIsHovered(true);
    onHoverStart?.();
  };

  const handleHoverEnd = () => {
    setIsHovered(false);
    onHoverEnd?.();
  };

  return (
    <motion.div
      className={cn(
        "relative isolate group/card",
        "w-[180px] transition-[width] duration-150 ease-out",
        isHovered && "w-[500px] z-50",
        className
      )}
      onMouseEnter={handleHoverStart}
      onMouseLeave={handleHoverEnd}
      layout
    >
      {/* Card Container */}
      <div
        className={cn(
          "relative overflow-hidden rounded-xl transition-all duration-150 ease-out",
          isHovered ? "aspect-[2/1.2]" : "aspect-[2/3]"
        )}
      >
        {/* Poster Image (Default View) */}
        <div
          className={cn(
            "absolute inset-0 transition-opacity duration-150",
            isHovered ? "opacity-0" : "opacity-100"
          )}
        >
          <Image
            src={getPosterUrl(movie.poster_path || null)}
            alt={movie.title || ""}
            fill
            className="object-cover"
            sizes="(max-width: 500px) 180px, 500px"
          />
        </div>

        {/* Backdrop Image (Hover View) */}
        <div
          className={cn(
            "absolute inset-0 transition-opacity duration-150",
            isHovered ? "opacity-100" : "opacity-0"
          )}
        >
          <Image
            src={getBackdropUrl(
              movie.backdrop_path || movie.poster_path || null
            )}
            alt={movie.title || ""}
            fill
            className="object-cover"
            sizes="(max-width: 500px) 180px, 500px"
          />
        </div>

        {/* Rank Badge */}
        {rank && (
          <div className="absolute -left-2 -top-2 w-12 h-12 bg-black/30 backdrop-blur-xl rounded-full flex items-center justify-center z-10 border border-white/20 shadow-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-full" />
            <span className="text-xl font-bold relative">{rank}</span>
          </div>
        )}

        {/* Content Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none" />

        {/* Content */}
        <div className="absolute inset-0 p-4 flex flex-col justify-end">
          {/* Basic Info - Always Visible */}
          <div className="flex flex-col">
            <h3 className="font-semibold text-lg text-white mb-1 line-clamp-1">
              {movie.title}
            </h3>
            <span className="text-sm text-white/70">
              {new Date(movie.release_date || "").getFullYear()}
            </span>
          </div>

          {/* Extended Info (Hover) */}
          <div
            className={cn(
              "overflow-hidden transition-all duration-150",
              isHovered ? "h-[220px] opacity-100 mt-4" : "h-0 opacity-0"
            )}
          >
            {/* Movie Stats */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-black/30 backdrop-blur-sm">
                <Star className="w-4 h-4 text-yellow-500" />
                <span className="text-sm font-medium text-yellow-500">
                  {movie.vote_average?.toFixed(1)}
                </span>
              </div>
              {runtime && (
                <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-black/30 backdrop-blur-sm">
                  <Clock className="w-4 h-4 text-white/70" />
                  <span className="text-sm font-medium text-white/70">
                    {hours}h {minutes}m
                  </span>
                </div>
              )}
            </div>

            {/* Overview */}
            <p className="text-sm text-white/70 line-clamp-4 mb-4">
              {movie.overview}
            </p>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => onMovieClick?.(movie)}
                className="flex-1 py-2 rounded-lg bg-white text-black font-medium hover:bg-white/90 transition-colors"
              >
                More Details
              </button>
              <button className="flex-1 py-2 rounded-lg bg-white/10 backdrop-blur-xl border border-white/10 text-white font-medium hover:bg-white/20 transition-colors">
                Add to List
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
