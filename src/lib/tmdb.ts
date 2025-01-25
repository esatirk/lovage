import { MovieDb } from "moviedb-promise";

if (!process.env.NEXT_PUBLIC_TMDB_API_KEY) {
  throw new Error("TMDB_API_KEY is not defined in environment variables");
}

export const tmdb = new MovieDb(process.env.NEXT_PUBLIC_TMDB_API_KEY);

export const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/";
export const POSTER_SIZES = {
  small: "w185",
  medium: "w342",
  large: "w500",
  original: "original",
} as const;

export const BACKDROP_SIZES = {
  small: "w300",
  medium: "w780",
  large: "w1280",
  original: "original",
} as const;

export function getPosterUrl(
  path: string | null,
  size: keyof typeof POSTER_SIZES = "medium"
): string {
  if (!path) return "/placeholder-poster.jpg";
  return `${TMDB_IMAGE_BASE_URL}${POSTER_SIZES[size]}${path}`;
}

export function getBackdropUrl(
  path: string | null,
  size: keyof typeof BACKDROP_SIZES = "large"
): string {
  if (!path) return "/placeholder-backdrop.jpg";
  return `${TMDB_IMAGE_BASE_URL}${BACKDROP_SIZES[size]}${path}`;
}
