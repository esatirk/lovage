"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogPortal,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { searchTorrents, TorrentInfo } from "@/lib/torrent-search";
import { useDebugLogs } from "@/hooks/use-debug-logs";
import { X, Copy, Download } from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface TorrentTestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PROVIDERS = ["YTS", "The Pirate Bay", "1337x", "RARBG"];

export function TorrentTestModal({
  open,
  onOpenChange,
}: TorrentTestModalProps) {
  const { addLog } = useDebugLogs();
  const [searchQuery, setSearchQuery] = useState("");
  const [year, setYear] = useState("");
  const [imdbId, setImdbId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<TorrentInfo[]>([]);
  const [enabledProviders, setEnabledProviders] = useState<Set<string>>(
    new Set(PROVIDERS)
  );

  const handleClose = () => {
    setSearchQuery("");
    setYear("");
    setImdbId("");
    setResults([]);
    setIsLoading(false);
    onOpenChange(false);
  };

  const handleSearch = async () => {
    if (!searchQuery) return;

    setIsLoading(true);
    addLog(`Testing torrent search for: ${searchQuery}`);

    try {
      const torrents = await searchTorrents({
        title: searchQuery,
        year: year ? parseInt(year) : undefined,
        imdbId: imdbId || undefined,
      });

      setResults(
        torrents.filter((torrent) => enabledProviders.has(torrent.source))
      );
      addLog(`Found ${torrents.length} torrents`);
    } catch (error) {
      console.error("Torrent search error:", error);
      addLog(`Torrent search error: ${error}`, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    addLog("Copied to clipboard");
  };

  const toggleProvider = (provider: string) => {
    const newProviders = new Set(enabledProviders);
    if (newProviders.has(provider)) {
      newProviders.delete(provider);
    } else {
      newProviders.add(provider);
    }
    setEnabledProviders(newProviders);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose} modal>
      <DialogPortal>
        <DialogContent className="bg-black border border-white/10 rounded-lg w-[1000px] max-h-[90vh] overflow-hidden shadow-2xl p-0">
          {/* Header */}
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">
              Test Torrent Search
            </DialogTitle>
            <button
              onClick={handleClose}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search Form */}
          <div className="p-6 border-b border-white/10 space-y-4">
            {/* Provider Toggles */}
            <div className="flex flex-wrap gap-4 mb-4">
              {PROVIDERS.map((provider) => (
                <div
                  key={provider}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10"
                >
                  <Switch
                    checked={enabledProviders.has(provider)}
                    onCheckedChange={() => toggleProvider(provider)}
                  />
                  <span className="text-sm">{provider}</span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-3">
                <Input
                  placeholder="Movie title"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-black border-white/10"
                />
              </div>
              <div>
                <Input
                  placeholder="Year (optional)"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="bg-black border-white/10"
                />
              </div>
              <div className="col-span-2">
                <Input
                  placeholder="IMDB ID (optional)"
                  value={imdbId}
                  onChange={(e) => setImdbId(e.target.value)}
                  className="bg-black border-white/10"
                />
              </div>
            </div>
            <Button
              onClick={handleSearch}
              disabled={!searchQuery || isLoading}
              className="w-full"
            >
              {isLoading ? "Searching..." : "Search"}
            </Button>
          </div>

          {/* Results */}
          <div className="p-6 max-h-[600px] overflow-y-auto space-y-4">
            {results.length === 0 ? (
              <div className="text-center text-white/50">
                {isLoading ? "Searching..." : "No results"}
              </div>
            ) : (
              results.map((torrent, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg bg-black border border-white/10 space-y-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-medium">{torrent.title}</h3>
                      <div className="flex items-center gap-2 mt-1 text-sm text-white/50">
                        <span>{torrent.source}</span>
                        <span>•</span>
                        <span>{torrent.quality}</span>
                        <span>•</span>
                        <span>{torrent.size}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {torrent.hash && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-2"
                          onClick={() => handleCopy(torrent.hash!)}
                        >
                          <Copy className="w-4 h-4" />
                          Hash
                        </Button>
                      )}
                      {torrent.magnet && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-2"
                            onClick={() => handleCopy(torrent.magnet!)}
                          >
                            <Copy className="w-4 h-4" />
                            Magnet
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-2"
                            onClick={() => {
                              window.open(torrent.magnet);
                              addLog(`Opening magnet link: ${torrent.magnet}`);
                            }}
                          >
                            <Download className="w-4 h-4" />
                            Download
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-white/50">Quality</div>
                      <div>{torrent.quality}</div>
                    </div>
                    <div>
                      <div className="text-white/50">Size</div>
                      <div>{torrent.size}</div>
                    </div>
                    <div>
                      <div className="text-white/50">Seeders</div>
                      <div className="text-green-500">{torrent.seeders}</div>
                    </div>
                    <div>
                      <div className="text-white/50">Leechers</div>
                      <div className="text-yellow-500">{torrent.leechers}</div>
                    </div>
                  </div>

                  {/* Links */}
                  <div className="flex items-center gap-4 text-xs text-white/50">
                    <div className="flex items-center gap-1">
                      <span>Source:</span>
                      <span className="font-medium text-white/70">
                        {torrent.source}
                      </span>
                    </div>
                    {torrent.hash && (
                      <div className="flex items-center gap-1">
                        <span>Hash:</span>
                        <code className="font-mono text-white/70">
                          {torrent.hash.slice(0, 16)}...
                        </code>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
