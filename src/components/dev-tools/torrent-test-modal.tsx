"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { searchTorrents, TorrentInfo } from "@/lib/torrent-search";
import { useDebugLogs } from "@/hooks/use-debug-logs";
import { X, Copy, Download, Play } from "lucide-react";

interface TorrentTestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function TorrentTestModal({
  open,
  onOpenChange,
}: TorrentTestModalProps) {
  const { addLog } = useDebugLogs();
  const [searchQuery, setSearchQuery] = useState("");
  const [year, setYear] = useState("");
  const [imdbId, setImdbId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<TorrentInfo[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);

  const handleClose = () => {
    setSearchQuery("");
    setYear("");
    setImdbId("");
    setResults([]);
    setSelectedProvider(null);
    onOpenChange(false);
  };

  const handleSearch = async () => {
    if (!searchQuery) return;

    setIsLoading(true);
    addLog(`Searching torrents for: ${searchQuery}`);

    try {
      const torrents = await searchTorrents({
        title: searchQuery,
        year: year ? parseInt(year) : undefined,
        imdbId: imdbId || undefined,
      });

      setResults(torrents);
      addLog(`Found ${torrents.length} torrents`);
    } catch (error) {
      console.error("Torrent search error:", error);
      addLog(`Torrent search error: ${error}`, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStream = (magnet: string | undefined) => {
    if (magnet) {
      try {
        const url = `/dev/torrent-streamer?magnet=${encodeURIComponent(magnet)}`;
        addLog(`Opening torrent streamer with magnet: ${magnet}`);
        window.open(url, "_blank");
      } catch (error) {
        console.error("Error opening torrent streamer:", error);
        addLog(`Error opening torrent streamer: ${error}`, "error");
      }
    }
  };

  const providers = Array.from(new Set(results.map((r) => r.source)));
  const filteredResults = selectedProvider
    ? results.filter((r) => r.source === selectedProvider)
    : results;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-[1000px] max-h-[90vh] overflow-y-auto bg-black">
        <div className="flex items-center justify-between mb-6">
          <DialogTitle>Torrent Test</DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="hover:bg-white/10"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Search Form */}
        <div className="flex gap-4 mb-8">
          <Input
            placeholder="Movie title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-white/5 border-white/10"
          />
          <Input
            placeholder="Year (optional)"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="w-32 bg-white/5 border-white/10"
          />
          <Input
            placeholder="IMDb ID (optional)"
            value={imdbId}
            onChange={(e) => setImdbId(e.target.value)}
            className="w-48 bg-white/5 border-white/10"
          />
          <Button onClick={handleSearch} disabled={isLoading} className="w-32">
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              "Search"
            )}
          </Button>
        </div>

        {/* Provider Tabs */}
        {results.length > 0 && (
          <div className="flex gap-2 mb-4">
            <Button
              variant={selectedProvider === null ? "default" : "outline"}
              onClick={() => setSelectedProvider(null)}
              className="gap-2"
            >
              All
              <span className="px-2 py-0.5 rounded-full bg-white/10 text-sm">
                {results.length}
              </span>
            </Button>
            {providers.map((provider) => (
              <Button
                key={provider}
                variant={selectedProvider === provider ? "default" : "outline"}
                onClick={() => setSelectedProvider(provider)}
                className="gap-2"
              >
                {provider}
                <span className="px-2 py-0.5 rounded-full bg-white/10 text-sm">
                  {results.filter((r) => r.source === provider).length}
                </span>
              </Button>
            ))}
          </div>
        )}

        {/* Results */}
        <div className="max-h-[600px] overflow-y-auto space-y-4">
          {filteredResults.length > 0 ? (
            filteredResults.map((result, index) => (
              <div
                key={index}
                className="p-4 rounded-lg bg-white/5 border border-white/10"
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <h3 className="font-medium mb-1">{result.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-white/60">
                      <span>{result.size}</span>
                      <span>Seeds: {result.seeders}</span>
                      <span>Peers: {result.leechers}</span>
                      <span>Quality: {result.quality}</span>
                      <span>Provider: {result.source}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (result.magnet) {
                          navigator.clipboard.writeText(result.magnet);
                          addLog(`Copied magnet link: ${result.magnet}`);
                        }
                      }}
                      className="h-8 w-8"
                    >
                      <Copy className="h-4 w-4" />
                      <span className="sr-only">Copy Magnet</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-2"
                      onClick={() => {
                        if (result.magnet) {
                          window.open(result.magnet, "_blank");
                          addLog(`Opened magnet link: ${result.magnet}`);
                        }
                      }}
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-2"
                      onClick={() => handleStream(result.magnet)}
                    >
                      <Play className="w-4 h-4" />
                      Stream
                    </Button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-white/40 py-12">
              {isLoading ? (
                <div className="flex flex-col items-center gap-4">
                  <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  <span>Searching all providers...</span>
                </div>
              ) : (
                "No results"
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
