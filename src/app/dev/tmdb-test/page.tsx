"use client";

import { useState, useEffect, useCallback } from "react";
import { MovieResult, MovieResponse, CreditsResponse } from "moviedb-promise";
import { tmdb, getPosterUrl, getBackdropUrl } from "@/lib/tmdb";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Search,
  Star,
  Calendar,
  Clock,
  Globe2,
  Languages,
  Tags,
  Users,
  Clapperboard,
  TrendingUp,
} from "lucide-react";
import Image from "next/image";
import debounce from "lodash/debounce";
import { motion, AnimatePresence } from "framer-motion";

interface MovieDetails extends Omit<MovieResponse, "status"> {
  runtime: number;
  tagline: string;
  status:
    | "Rumored"
    | "Planned"
    | "In Production"
    | "Post Production"
    | "Released"
    | "Canceled"
    | undefined;
  budget: number;
  revenue: number;
  genres: Array<{ id: number; name: string }>;
  production_companies: Array<{ id: number; name: string }>;
  production_countries: Array<{ iso_3166_1: string; name: string }>;
  spoken_languages: Array<{ iso_639_1: string; english_name: string }>;
  keywords?: { keywords: Array<{ id: number; name: string }> };
}

interface MovieCredits extends CreditsResponse {
  cast: Array<{
    id: number;
    name: string;
    character: string;
    profile_path: string | null;
  }>;
  crew: Array<{
    id: number;
    name: string;
    job: string;
    profile_path: string | null;
  }>;
}

interface Company {
  id: number;
  name: string;
}

interface Person {
  id: number;
  name: string;
  character?: string;
  job?: string;
  profile_path: string | null;
}

interface Country {
  iso_3166_1: string;
  name: string;
}

interface Language {
  iso_639_1: string;
  english_name: string;
}

interface Keyword {
  id: number;
  name: string;
}

interface CrewMember extends Person {
  job: string;
}

interface CastMember extends Person {
  character: string;
}

export default function TMDBTest() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MovieResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<MovieResult | null>(null);
  const [movieDetails, setMovieDetails] = useState<MovieDetails | null>(null);
  const [movieCredits, setMovieCredits] = useState<MovieCredits | null>(null);
  const [similarMovies, setSimilarMovies] = useState<MovieResult[]>([]);

  const searchMovies = async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const response = await tmdb.searchMovie({ query: searchQuery });
      setResults(response.results || []);
    } catch (error: unknown) {
      console.error(
        "Failed to search movies:",
        error instanceof Error ? error.message : String(error)
      );
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMovieDetails = async (movieId: number) => {
    try {
      const [details, credits, similar] = await Promise.all([
        tmdb.movieInfo({ id: movieId }),
        tmdb.movieCredits({ id: movieId }),
        tmdb.movieSimilar({ id: movieId }),
      ]);
      setMovieDetails(details as MovieDetails);
      setMovieCredits(credits as MovieCredits);
      setSimilarMovies(similar.results || []);
    } catch (error: unknown) {
      console.error(
        "Failed to fetch movie details:",
        error instanceof Error ? error.message : String(error)
      );
    }
  };

  const debouncedSearch = useCallback(
    debounce((value: string) => searchMovies(value), 500),
    []
  );

  useEffect(() => {
    debouncedSearch(query);
    return () => {
      debouncedSearch.cancel();
    };
  }, [query, debouncedSearch]);

  useEffect(() => {
    if (selectedMovie?.id) {
      fetchMovieDetails(selectedMovie.id);
    } else {
      setMovieDetails(null);
      setMovieCredits(null);
      setSimilarMovies([]);
    }
  }, [selectedMovie]);

  const formatRuntime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="container max-w-6xl mx-auto p-4 space-y-6">
      <Card className="border-none bg-background/50 backdrop-blur">
        <CardHeader>
          <CardTitle>TMDB API Test</CardTitle>
          <CardDescription>
            Test TMDB API integration for movie and TV show data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search movies..."
                className="pl-8"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Results Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-6">
            <AnimatePresence mode="popLayout">
              {loading
                ? // Loading skeletons
                  Array.from({ length: 10 }).map((_, i) => (
                    <motion.div
                      key={`skeleton-${i}`}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="aspect-[2/3] rounded-lg bg-accent animate-pulse"
                    />
                  ))
                : results.map((movie) => (
                    <motion.button
                      key={movie.id}
                      layoutId={`movie-${movie.id}`}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      onClick={() => setSelectedMovie(movie)}
                      className="group relative aspect-[2/3] rounded-lg overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <Image
                        src={getPosterUrl(movie.poster_path || null)}
                        alt={movie.title || "Movie poster"}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute bottom-0 left-0 right-0 p-4 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                        <h3 className="font-semibold truncate">
                          {movie.title}
                        </h3>
                        <div className="flex items-center gap-1 text-sm">
                          <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                          <span>{movie.vote_average?.toFixed(1)}</span>
                        </div>
                      </div>
                    </motion.button>
                  ))}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>

      {/* Movie Details Modal */}
      <Dialog
        open={!!selectedMovie}
        onOpenChange={() => setSelectedMovie(null)}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0">
          {selectedMovie && movieDetails && (
            <div className="relative">
              {/* Backdrop Image */}
              <div className="relative h-[40vh] overflow-hidden">
                <Image
                  src={getBackdropUrl(movieDetails.backdrop_path || null)}
                  alt={movieDetails.title || "Movie backdrop"}
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
              </div>

              {/* Content */}
              <div className="relative -mt-32 p-6 space-y-6">
                <div className="flex gap-6">
                  {/* Poster */}
                  <div className="relative shrink-0 w-40 aspect-[2/3] rounded-lg overflow-hidden">
                    <Image
                      src={getPosterUrl(movieDetails.poster_path || null)}
                      alt={movieDetails.title || "Movie poster"}
                      fill
                      className="object-cover"
                      priority
                    />
                  </div>

                  {/* Basic Info */}
                  <div className="flex-1 min-w-0">
                    <DialogHeader>
                      <DialogTitle className="text-3xl font-bold">
                        {movieDetails.title}
                      </DialogTitle>
                      <DialogDescription className="text-base">
                        {movieDetails.tagline}
                      </DialogDescription>
                    </DialogHeader>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {movieDetails.genres?.map((genre: any) => (
                        <Badge
                          key={genre.id}
                          variant="secondary"
                          className="rounded-full"
                        >
                          {genre.name}
                        </Badge>
                      ))}
                    </div>

                    <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{movieDetails.release_date}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{formatRuntime(movieDetails.runtime)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                        <span>
                          {movieDetails.vote_average?.toFixed(1)} (
                          {movieDetails.vote_count} votes)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tabs */}
                <Tabs defaultValue="overview" className="mt-6">
                  <TabsList className="w-full justify-start">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="cast">Cast & Crew</TabsTrigger>
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="similar">Similar Movies</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="mt-4">
                    <ScrollArea className="h-[40vh] pr-4">
                      <div className="space-y-6">
                        <p className="text-lg leading-relaxed">
                          {movieDetails.overview}
                        </p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">
                              Status
                            </p>
                            <p className="font-medium">{movieDetails.status}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">
                              Budget
                            </p>
                            <p className="font-medium">
                              {formatMoney(movieDetails.budget)}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">
                              Revenue
                            </p>
                            <p className="font-medium">
                              {formatMoney(movieDetails.revenue)}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">
                              Original Language
                            </p>
                            <p className="font-medium">
                              {movieDetails.original_language?.toUpperCase()}
                            </p>
                          </div>
                        </div>

                        {movieDetails.production_companies?.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium mb-2">
                              Production Companies
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {movieDetails.production_companies.map(
                                (company: Company) => (
                                  <Badge
                                    key={company.id}
                                    variant="outline"
                                    className="rounded-full"
                                  >
                                    {company.name}
                                  </Badge>
                                )
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </TabsContent>

                  <TabsContent value="cast" className="mt-4">
                    <ScrollArea className="h-[40vh] pr-4">
                      <div className="space-y-6">
                        {/* Cast */}
                        <div>
                          <h4 className="text-lg font-medium mb-4">Top Cast</h4>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {movieCredits?.cast
                              ?.slice(0, 6)
                              .map((person: CastMember) => (
                                <div
                                  key={person.id}
                                  className="flex items-center gap-3"
                                >
                                  <div className="relative w-12 h-12 rounded-full overflow-hidden bg-accent">
                                    {person.profile_path && (
                                      <Image
                                        src={getPosterUrl(
                                          person.profile_path,
                                          "small"
                                        )}
                                        alt={person.name}
                                        fill
                                        className="object-cover"
                                      />
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium truncate">
                                      {person.name}
                                    </p>
                                    <p className="text-sm text-muted-foreground truncate">
                                      {person.character}
                                    </p>
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>

                        {/* Crew */}
                        <div>
                          <h4 className="text-lg font-medium mb-4">Key Crew</h4>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {movieCredits?.crew
                              ?.filter((person: CrewMember) =>
                                ["Director", "Producer", "Screenplay"].includes(
                                  person.job
                                )
                              )
                              .slice(0, 6)
                              .map((person: CrewMember) => (
                                <div
                                  key={`${person.id}-${person.job}`}
                                  className="flex items-center gap-3"
                                >
                                  <div className="relative w-12 h-12 rounded-full overflow-hidden bg-accent">
                                    {person.profile_path && (
                                      <Image
                                        src={getPosterUrl(
                                          person.profile_path,
                                          "small"
                                        )}
                                        alt={person.name}
                                        fill
                                        className="object-cover"
                                      />
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium truncate">
                                      {person.name}
                                    </p>
                                    <p className="text-sm text-muted-foreground truncate">
                                      {person.job}
                                    </p>
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      </div>
                    </ScrollArea>
                  </TabsContent>

                  <TabsContent value="details" className="mt-4">
                    <ScrollArea className="h-[40vh] pr-4">
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <h4 className="text-sm font-medium flex items-center gap-2">
                              <Globe2 className="h-4 w-4" />
                              Production Countries
                            </h4>
                            <p className="mt-1 text-muted-foreground">
                              {movieDetails.production_countries
                                ?.map((country: Country) => country.name)
                                .join(", ")}
                            </p>
                          </div>

                          <div>
                            <h4 className="text-sm font-medium flex items-center gap-2">
                              <Languages className="h-4 w-4" />
                              Spoken Languages
                            </h4>
                            <p className="mt-1 text-muted-foreground">
                              {movieDetails.spoken_languages
                                ?.map((lang: Language) => lang.english_name)
                                .join(", ")}
                            </p>
                          </div>

                          <div>
                            <h4 className="text-sm font-medium flex items-center gap-2">
                              <Tags className="h-4 w-4" />
                              Keywords
                            </h4>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {movieDetails.keywords?.keywords?.map(
                                (keyword: Keyword) => (
                                  <Badge
                                    key={keyword.id}
                                    variant="secondary"
                                    className="rounded-full"
                                  >
                                    {keyword.name}
                                  </Badge>
                                )
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <h4 className="text-sm font-medium flex items-center gap-2">
                              <Users className="h-4 w-4" />
                              Adult Content
                            </h4>
                            <p className="mt-1 text-muted-foreground">
                              {movieDetails.adult ? "Yes" : "No"}
                            </p>
                          </div>

                          <div>
                            <h4 className="text-sm font-medium flex items-center gap-2">
                              <Clapperboard className="h-4 w-4" />
                              Original Title
                            </h4>
                            <p className="mt-1 text-muted-foreground">
                              {movieDetails.original_title}
                            </p>
                          </div>

                          <div>
                            <h4 className="text-sm font-medium flex items-center gap-2">
                              <TrendingUp className="h-4 w-4" />
                              Popularity
                            </h4>
                            <p className="mt-1 text-muted-foreground">
                              {movieDetails.popularity?.toFixed(2)} points
                            </p>
                          </div>
                        </div>
                      </div>
                    </ScrollArea>
                  </TabsContent>

                  <TabsContent value="similar" className="mt-4">
                    <ScrollArea className="h-[40vh]">
                      <div className="grid grid-cols-3 md:grid-cols-4 gap-4 pr-4">
                        {similarMovies.map((movie) => (
                          <button
                            key={movie.id}
                            onClick={() => setSelectedMovie(movie)}
                            className="group relative aspect-[2/3] rounded-lg overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary"
                          >
                            <Image
                              src={getPosterUrl(movie.poster_path || null)}
                              alt={movie.title || "Movie poster"}
                              fill
                              className="object-cover transition-transform group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="absolute bottom-0 left-0 right-0 p-4 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                              <h3 className="font-semibold truncate">
                                {movie.title}
                              </h3>
                              <div className="flex items-center gap-1 text-sm">
                                <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                                <span>{movie.vote_average?.toFixed(1)}</span>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </ScrollArea>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
