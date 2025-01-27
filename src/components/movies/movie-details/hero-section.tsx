"use client";

import { MovieResult } from "moviedb-promise";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  PlayCircle,
  Star,
  Clock,
  ArrowLeft,
  Plus,
  ChevronDown,
} from "lucide-react";
import { getBackdropUrl, getPosterUrl } from "@/lib/tmdb";
import { TorrentInfo } from "@/lib/torrent-search";
import { useDebugLogs } from "@/hooks/use-debug-logs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeroSectionProps {
  movie: MovieResult;
  details: {
    runtime: number;
  } | null;
  onClose: () => void;
  torrents: TorrentInfo[];
  selectedQuality: string;
  isTorrentLoading: boolean;
  onQualitySelect: (quality: string) => void;
}

const QUALITIES = ["2160p", "1080p", "720p"];

export function HeroSection({
  movie,
  details,
  onClose,
  torrents,
  selectedQuality,
  isTorrentLoading,
  onQualitySelect,
}: HeroSectionProps) {
  const { addLog } = useDebugLogs();
  const hours = details ? Math.floor(details.runtime / 60) : 0;
  const minutes = details ? details.runtime % 60 : 0;

  const selectedTorrent = torrents.find((t) =>
    t.quality.toLowerCase().includes(selectedQuality.toLowerCase())
  );

  const availableQualities = QUALITIES.filter((quality) =>
    torrents.some((t) =>
      t.quality.toLowerCase().includes(quality.toLowerCase())
    )
  );

  const handleStream = (torrent: TorrentInfo) => {
    if (torrent.magnet) {
      try {
        const url = `/dev/torrent-streamer?magnet=${encodeURIComponent(torrent.magnet)}`;
        addLog(`Opening torrent streamer with magnet: ${torrent.magnet}`);
        const newWindow = window.open(url, "_blank");
        if (!newWindow) {
          throw new Error("Popup was blocked");
        }
      } catch (error) {
        console.error("Error opening torrent streamer:", error);
        addLog(`Error opening torrent streamer: ${error}`, "error");
        // Fallback to direct navigation if popup is blocked
        window.location.href = `/dev/torrent-streamer?magnet=${encodeURIComponent(torrent.magnet)}`;
      }
    }
  };

  return (
    <div className="relative h-[70vh]">
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

      {/* Back Button */}
      <button
        onClick={onClose}
        className="fixed left-8 top-8 flex items-center gap-2 px-4 py-2 rounded-full bg-black/30 backdrop-blur-xl border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all z-[110]"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back</span>
      </button>

      {/* Content */}
      <div className="absolute inset-x-0 bottom-0 container mx-auto px-8 pb-12">
        <div className="flex gap-8">
          {/* Poster */}
          <div className="relative w-[300px] aspect-[2/3] rounded-xl overflow-hidden shadow-2xl">
            <Image
              src={getPosterUrl(movie.poster_path || null)}
              alt={movie.title || ""}
              fill
              className="object-cover"
            />
          </div>

          {/* Info */}
          <div className="flex-1 pt-12">
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-xl border border-white/10">
                <Star className="w-4 h-4 text-yellow-500" />
                <span className="text-sm font-medium text-yellow-500">
                  {movie.vote_average?.toFixed(1)}
                </span>
              </div>
              {details && (
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-xl border border-white/10">
                  <Clock className="w-4 h-4 text-white/70" />
                  <span className="text-sm font-medium text-white/90">
                    {hours}h {minutes}m
                  </span>
                </div>
              )}
              <div className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-xl border border-white/10">
                <span className="text-sm font-medium text-white/90">
                  {new Date(movie.release_date || "").getFullYear()}
                </span>
              </div>
            </div>

            <h1 className="text-5xl font-bold mb-4">{movie.title}</h1>
            <p className="text-xl text-white/80 mb-8 max-w-3xl">
              {movie.overview}
            </p>

            {/* Stream Info */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4 mb-8">
              {isTorrentLoading ? (
                <div className="flex items-center justify-center h-20">
                  <div className="w-6 h-6 border-2 border-white/20 border-t-white/80 rounded-full animate-spin" />
                </div>
              ) : torrents.length > 0 ? (
                <div className="space-y-4">
                  {/* Quality Selection */}
                  <div className="flex items-center gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-white/10 border-white/10 hover:bg-white/20 gap-2 min-w-[120px]"
                        >
                          {selectedQuality || "Select Quality"}
                          <ChevronDown className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="start"
                        className="bg-black/90 backdrop-blur-xl border-white/10"
                      >
                        {availableQualities.map((quality) => (
                          <DropdownMenuItem
                            key={quality}
                            onClick={() => onQualitySelect(quality)}
                            className="text-white/90 hover:text-white hover:bg-white/10 cursor-pointer"
                          >
                            {quality}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Selected Torrent Info */}
                  {selectedQuality && selectedTorrent && (
                    <div className="grid grid-cols-4 gap-4">
                      <div>
                        <div className="text-sm text-white/60 mb-1">
                          Quality
                        </div>
                        <div className="font-medium">
                          {selectedTorrent.quality}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-white/60 mb-1">Size</div>
                        <div className="font-medium">
                          {selectedTorrent.size}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-white/60 mb-1">
                          Seeders
                        </div>
                        <div className="font-medium text-green-500">
                          {selectedTorrent.seeders}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-white/60 mb-1">
                          Leechers
                        </div>
                        <div className="font-medium text-yellow-500">
                          {selectedTorrent.leechers}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center text-white/60 py-4">
                  No torrent found
                </div>
              )}
            </div>

            <div className="flex items-center gap-4">
              <Button
                size="lg"
                onClick={() => selectedTorrent && handleStream(selectedTorrent)}
                className="gap-2 bg-white text-black hover:bg-white/90 transition-colors"
                disabled={!selectedTorrent}
              >
                <PlayCircle className="w-5 h-5" />
                Stream Now
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="gap-2 bg-white/10 backdrop-blur-xl border-white/10 hover:bg-white/20"
              >
                <Plus className="w-5 h-5" />
                Add to List
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
