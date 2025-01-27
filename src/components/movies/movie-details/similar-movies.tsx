"use client";

import { MovieResult } from "moviedb-promise";
import { MovieCarousel } from "@/components/movies/movie-carousel";

interface SimilarMoviesProps {
  movies: MovieResult[];
  onMovieClick?: (movie: MovieResult) => void;
  isLoading: boolean;
}

export function SimilarMovies({
  movies,
  onMovieClick,
  isLoading,
}: SimilarMoviesProps) {
  if (movies.length === 0) return null;

  return (
    <div className="container mx-auto px-8 pb-12">
      <h2 className="text-2xl font-bold mb-6">Similar Movies</h2>
      <MovieCarousel
        movies={movies}
        onMovieClick={onMovieClick}
        isLoading={isLoading}
      />
    </div>
  );
}
