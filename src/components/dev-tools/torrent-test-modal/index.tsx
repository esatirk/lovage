"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { TorrentInfo } from "@/lib/torrent-search";
import { useDebugLogs } from "@/hooks/use-debug-logs";
import { searchTorrents } from "@/lib/torrent-search";
import { useState } from "react";
import { SearchForm } from "./search-form";
import { ProviderTabs } from "./provider-tabs";
import { TorrentResults } from "./torrent-results";
import { X } from "lucide-react";

interface TorrentTestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

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
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);

  const handleClose = () => {
    setSearchQuery("");
    setYear("");
    setImdbId("");
    setResults([]);
    setSelectedProvider(null);
    setIsLoading(false);
    onOpenChange(false);
  };

  const handleSearch = async () => {
    if (!searchQuery && !imdbId) {
      addLog("Please enter a movie title or IMDb ID", "error");
      return;
    }

    setIsLoading(true);
    setResults([]);
    setSelectedProvider(null);

    try {
      addLog(`Searching for torrents: ${searchQuery || imdbId}`);
      const searchResults = await searchTorrents({
        query: searchQuery,
        year: year ? parseInt(year) : undefined,
        imdbId,
      });

      setResults(searchResults);
      addLog(`Found ${searchResults.length} torrents`);
    } catch (error) {
      console.error("Error searching torrents:", error);
      addLog(`Error searching torrents: ${error}`, "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-black/90 backdrop-blur-xl border-white/10 w-[1000px] max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Torrent Search</h2>
          <button
            onClick={handleClose}
            className="text-white/60 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
            <span className="sr-only">Close</span>
          </button>
        </div>

        <SearchForm
          searchQuery={searchQuery}
          year={year}
          imdbId={imdbId}
          isLoading={isLoading}
          onSearchQueryChange={setSearchQuery}
          onYearChange={setYear}
          onImdbIdChange={setImdbId}
          onSearch={handleSearch}
        />

        {results.length > 0 && (
          <ProviderTabs
            results={results}
            selectedProvider={selectedProvider}
            onProviderSelect={setSelectedProvider}
          />
        )}

        <TorrentResults
          results={results}
          isLoading={isLoading}
          selectedProvider={selectedProvider}
        />
      </DialogContent>
    </Dialog>
  );
}
