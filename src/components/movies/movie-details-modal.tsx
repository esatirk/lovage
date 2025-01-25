"use client";

import { MovieResult } from "moviedb-promise";
import Image from "next/image";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PlayCircle, Star, Clock, Calendar, X } from "lucide-react";
import { getBackdropUrl } from "@/lib/tmdb";
import { motion } from "framer-motion";

interface MovieDetailsModalProps {
  movie: MovieResult | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPlayClick?: (movie: MovieResult) => void;
}

export function MovieDetailsModal({
  movie,
  open,
  onOpenChange,
  onPlayClick,
}: MovieDetailsModalProps) {
  if (!movie) return null;

  const runtime = Math.floor(Math.random() * 60) + 90; // Simulated runtime between 90-150 minutes
  const hours = Math.floor(runtime / 60);
  const minutes = runtime % 60;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl p-0 bg-transparent border-0">
        <div className="relative bg-black/50 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/10">
          {/* Close Button */}
          <button
            onClick={() => onOpenChange(false)}
            className="absolute right-4 top-4 z-50 w-10 h-10 rounded-full bg-black/50 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Background Image */}
          <div className="relative h-[40vh] w-full">
            <Image
              src={getBackdropUrl(movie.backdrop_path || null, "original")}
              alt={movie.title || ""}
              fill
              className="object-cover"
              priority
              quality={100}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
          </div>

          {/* Content */}
          <div className="relative p-8 -mt-20">
            {/* Movie Info */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-xl border border-white/10">
                <Star className="w-4 h-4 text-yellow-500" />
                <span className="text-sm font-medium text-yellow-500">
                  {movie.vote_average?.toFixed(1)}
                </span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-xl border border-white/10">
                <Clock className="w-4 h-4 text-white/70" />
                <span className="text-sm font-medium text-white/90">
                  {hours}h {minutes}m
                </span>
              </div>
              <div className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-xl border border-white/10">
                <span className="text-sm font-medium text-white/90">
                  {new Date(movie.release_date || "").getFullYear()}
                </span>
              </div>
            </div>

            {/* Title and Overview */}
            <h2 className="text-4xl font-bold mb-4">{movie.title}</h2>
            <p className="text-lg text-white/80 mb-8 max-w-3xl">
              {movie.overview}
            </p>

            {/* Additional Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Details</h3>
                <dl className="space-y-2">
                  <div className="flex items-start">
                    <dt className="w-24 text-white/60">Status</dt>
                    <dd>{movie.status || "Released"}</dd>
                  </div>
                  <div className="flex items-start">
                    <dt className="w-24 text-white/60">Language</dt>
                    <dd>{movie.original_language?.toUpperCase()}</dd>
                  </div>
                  <div className="flex items-start">
                    <dt className="w-24 text-white/60">Budget</dt>
                    <dd>
                      {movie.budget
                        ? `$${(movie.budget / 1000000).toFixed(1)}M`
                        : "N/A"}
                    </dd>
                  </div>
                  <div className="flex items-start">
                    <dt className="w-24 text-white/60">Revenue</dt>
                    <dd>
                      {movie.revenue
                        ? `$${(movie.revenue / 1000000).toFixed(1)}M`
                        : "N/A"}
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Production</h3>
                <dl className="space-y-2">
                  <div className="flex items-start">
                    <dt className="w-24 text-white/60">Director</dt>
                    <dd>Coming soon</dd>
                  </div>
                  <div className="flex items-start">
                    <dt className="w-24 text-white/60">Cast</dt>
                    <dd>Coming soon</dd>
                  </div>
                  <div className="flex items-start">
                    <dt className="w-24 text-white/60">Genre</dt>
                    <dd>Coming soon</dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-4">
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
                className="gap-2 bg-white/10 backdrop-blur-xl border-white/10 hover:bg-white/20"
              >
                Add to Watchlist
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
