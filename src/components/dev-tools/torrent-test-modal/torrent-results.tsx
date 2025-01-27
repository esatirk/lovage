"use client";

import { Button } from "@/components/ui/button";
import { TorrentInfo } from "@/lib/torrent-search";
import { useDebugLogs } from "@/hooks/use-debug-logs";
import { Copy, Download, Play } from "lucide-react";
import { toast } from "sonner";

interface TorrentResultsProps {
  results: TorrentInfo[];
  isLoading: boolean;
  selectedProvider: string | null;
}

export function TorrentResults({
  results,
  isLoading,
  selectedProvider,
}: TorrentResultsProps) {
  const { addLog } = useDebugLogs();

  const handleCopyMagnet = async (magnet: string) => {
    try {
      await navigator.clipboard.writeText(magnet);
      toast.success("Magnet link copied to clipboard");
      addLog(`Copied magnet link: ${magnet}`);
    } catch (error) {
      console.error("Error copying magnet link:", error);
      toast.error("Failed to copy magnet link");
      addLog(`Error copying magnet link: ${error}`, "error");
    }
  };

  const handleDownload = (magnet: string) => {
    try {
      window.open(magnet, "_blank");
      addLog(`Opened magnet link: ${magnet}`);
    } catch (error) {
      console.error("Error opening magnet link:", error);
      addLog(`Error opening magnet link: ${error}`, "error");
    }
  };

  const handleStream = (magnet: string) => {
    try {
      const url = `/dev/torrent-streamer?magnet=${encodeURIComponent(magnet)}`;
      addLog(`Opening torrent streamer with magnet: ${magnet}`);
      const newWindow = window.open(url, "_blank");
      if (!newWindow) {
        throw new Error("Popup was blocked");
      }
    } catch (error) {
      console.error("Error opening torrent streamer:", error);
      addLog(`Error opening torrent streamer: ${error}`, "error");
      // Fallback to direct navigation if popup is blocked
      window.location.href = `/dev/torrent-streamer?magnet=${encodeURIComponent(magnet)}`;
    }
  };

  const filteredResults = selectedProvider
    ? results.filter((r) => r.source === selectedProvider)
    : results;

  return (
    <div className="max-h-[600px] overflow-y-auto space-y-4">
      {filteredResults.length > 0 ? (
        filteredResults.map((result, index) => (
          <div
            key={index}
            className="p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex-1">
                <h3 className="font-medium mb-1">{result.title}</h3>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-white/60">
                  <span>{result.size}</span>
                  <span className="text-green-500">
                    Seeds: {result.seeders}
                  </span>
                  <span className="text-yellow-500">
                    Peers: {result.leechers}
                  </span>
                  <span>Quality: {result.quality}</span>
                  <span>Provider: {result.source}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    result.magnet && handleCopyMagnet(result.magnet)
                  }
                  className="h-8 w-8 hover:bg-white/10"
                  title="Copy Magnet Link"
                >
                  <Copy className="h-4 w-4" />
                  <span className="sr-only">Copy Magnet</span>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-2 hover:bg-white/10"
                  onClick={() => result.magnet && handleDownload(result.magnet)}
                >
                  <Download className="w-4 h-4" />
                  Download
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-2 hover:bg-white/10"
                  onClick={() => result.magnet && handleStream(result.magnet)}
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
  );
}
