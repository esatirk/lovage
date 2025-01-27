"use client";

import { Button } from "@/components/ui/button";
import { TorrentInfo } from "@/lib/torrent-search";

interface ProviderTabsProps {
  results: TorrentInfo[];
  selectedProvider: string | null;
  onProviderSelect: (provider: string | null) => void;
}

const ALL_PROVIDERS = ["The Pirate Bay", "YTS", "1337x", "RARBG"];

export function ProviderTabs({
  results,
  selectedProvider,
  onProviderSelect,
}: ProviderTabsProps) {
  const getProviderCount = (provider: string | null) =>
    provider
      ? results.filter((r) => r.source === provider).length
      : results.length;

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      <Button
        variant={selectedProvider === null ? "default" : "outline"}
        onClick={() => onProviderSelect(null)}
        className="gap-2"
      >
        All Sources
        <span className="px-2 py-0.5 text-xs rounded-full bg-white/10">
          {getProviderCount(null)}
        </span>
      </Button>
      {ALL_PROVIDERS.map((provider) => (
        <Button
          key={provider}
          variant={selectedProvider === provider ? "default" : "outline"}
          onClick={() => onProviderSelect(provider)}
          className="gap-2"
        >
          {provider}
          <span className="px-2 py-0.5 text-xs rounded-full bg-white/10">
            {getProviderCount(provider)}
          </span>
        </Button>
      ))}
    </div>
  );
}
