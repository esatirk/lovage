"use client";

import { MovieResult } from "moviedb-promise";
import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { MovieCard } from "./movie-card";
import { cn } from "@/lib/utils";

export interface MovieCarouselProps {
  title?: string;
  movies: MovieResult[];
  onMovieClick?: (movie: MovieResult) => void;
  isLoading?: boolean;
  showRank?: boolean;
}

export function MovieCarousel({
  title,
  movies,
  onMovieClick,
  isLoading,
  showRank,
}: MovieCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showLeftButton, setShowLeftButton] = useState(false);
  const [showRightButton, setShowRightButton] = useState(true);

  const handleScroll = () => {
    if (!containerRef.current) return;

    const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
    setShowLeftButton(scrollLeft > 0);
    setShowRightButton(scrollLeft < scrollWidth - clientWidth - 10);
  };

  const scroll = (direction: "left" | "right") => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const scrollAmount = container.clientWidth * 0.8;
    const targetScroll =
      container.scrollLeft +
      (direction === "left" ? -scrollAmount : scrollAmount);

    container.scrollTo({
      left: targetScroll,
      behavior: "smooth",
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {title && <h2 className="text-2xl font-bold">{title}</h2>}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="aspect-[2/3] rounded-xl bg-white/5 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {title && <h2 className="text-2xl font-bold">{title}</h2>}
      <div className="group/carousel relative">
        {/* Navigation Buttons */}
        <button
          onClick={() => scroll("left")}
          className={cn(
            "absolute -left-4 top-1/2 -translate-y-1/2 z-[70]",
            "w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm border border-white/10",
            "flex items-center justify-center",
            "hover:bg-black/70 transition-colors",
            !showLeftButton && "hidden"
          )}
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={() => scroll("right")}
          className={cn(
            "absolute -right-4 top-1/2 -translate-y-1/2 z-[70]",
            "w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm border border-white/10",
            "flex items-center justify-center",
            "hover:bg-black/70 transition-colors",
            !showRightButton && "hidden"
          )}
          aria-label="Scroll right"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Movies Container */}
        <div
          ref={containerRef}
          onScroll={handleScroll}
          className="flex gap-4 overflow-x-hidden"
        >
          {movies.map((movie, index) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              onMovieClick={onMovieClick}
              rank={showRank ? index + 1 : undefined}
              className="flex-shrink-0"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
