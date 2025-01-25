"use client";

import { MovieResult } from "moviedb-promise";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { PlayCircle, Info, Star } from "lucide-react";
import { getBackdropUrl } from "@/lib/tmdb";

interface HeroSectionProps {
  movie: MovieResult | null;
}

export function HeroSection({ movie }: HeroSectionProps) {
  if (!movie) {
    return (
      // Loading Skeleton
      <div className="relative h-[85vh] bg-black/50 animate-pulse">
        <div className="absolute bottom-0 left-0 right-0 p-12 space-y-6">
          <div className="h-12 w-2/3 bg-white/10 rounded-lg" />
          <div className="space-y-3">
            <div className="h-6 w-full max-w-2xl bg-white/10 rounded-lg" />
            <div className="h-6 w-4/5 max-w-2xl bg-white/10 rounded-lg" />
          </div>
          <div className="flex items-center gap-4">
            <div className="h-11 w-32 bg-white/10 rounded-lg" />
            <div className="h-11 w-32 bg-white/10 rounded-lg" />
            <div className="h-11 w-40 bg-white/10 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-[85vh] overflow-hidden">
      <Image
        src={getBackdropUrl(movie.backdrop_path || null, "original")}
        alt={movie.title || ""}
        fill
        className="object-cover"
        priority
        quality={100}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-12 space-y-6">
        <h1 className="text-5xl font-bold max-w-4xl">{movie.title}</h1>
        <p className="text-xl text-white/80 max-w-2xl line-clamp-3">
          {movie.overview}
        </p>
        <div className="flex items-center gap-4">
          <Button size="lg" className="gap-2">
            <PlayCircle className="w-5 h-5" />
            Watch Now
          </Button>
          <Button size="lg" variant="outline" className="gap-2">
            <Info className="w-5 h-5" />
            More Info
          </Button>
          <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/10 backdrop-blur-sm">
            <div className="flex items-center gap-1.5">
              <Star className="w-5 h-5 text-yellow-500" />
              <span className="font-medium text-yellow-500">
                {movie.vote_average?.toFixed(1)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
