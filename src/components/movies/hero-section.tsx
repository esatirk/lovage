"use client";

import { MovieResult } from "moviedb-promise";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { PlayCircle, Info, Star, Clock } from "lucide-react";
import { getBackdropUrl } from "@/lib/tmdb";
import { motion } from "framer-motion";

interface HeroSectionProps {
  movie: MovieResult | null;
  onPlayClick?: (movie: MovieResult) => void;
  onInfoClick?: (movie: MovieResult) => void;
}

export function HeroSection({
  movie,
  onPlayClick,
  onInfoClick,
}: HeroSectionProps) {
  if (!movie) {
    return (
      <div className="relative w-full h-[80vh] bg-black/50 animate-pulse">
        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
      </div>
    );
  }

  return (
    <div className="relative w-full h-[80vh]">
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

      {/* Content */}
      <div className="absolute inset-0 flex items-center">
        <div className="container mx-auto px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl space-y-6"
          >
            {/* Movie Info */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-black/30 backdrop-blur-sm border border-white/10">
                <Star className="w-4 h-4 text-yellow-500" />
                <span className="text-sm font-medium text-yellow-500">
                  {movie.vote_average?.toFixed(1)}
                </span>
              </div>
              <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-black/30 backdrop-blur-sm border border-white/10">
                <Clock className="w-4 h-4 text-white/70" />
                <span className="text-sm font-medium text-white/70">
                  {new Date(movie.release_date || "").getFullYear()}
                </span>
              </div>
            </div>

            <h1 className="text-6xl font-bold text-white">{movie.title}</h1>

            <p className="text-xl text-white/90 leading-relaxed">
              {movie.overview}
            </p>

            <div className="flex items-center gap-4 pt-4">
              <Button
                size="lg"
                onClick={() => onPlayClick?.(movie)}
                className="gap-2 bg-white text-black hover:bg-white/90 transition-colors"
              >
                <PlayCircle className="w-5 h-5" />
                Watch Now
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => onInfoClick?.(movie)}
                className="gap-2 bg-white/10 backdrop-blur-xl border-white/10 hover:bg-white/20"
              >
                <Info className="w-5 h-5" />
                More Info
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
