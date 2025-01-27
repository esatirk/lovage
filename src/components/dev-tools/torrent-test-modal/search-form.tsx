"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface SearchFormProps {
  searchQuery: string;
  year: string;
  imdbId: string;
  isLoading: boolean;
  onSearchQueryChange: (value: string) => void;
  onYearChange: (value: string) => void;
  onImdbIdChange: (value: string) => void;
  onSearch: () => void;
}

export function SearchForm({
  searchQuery,
  year,
  imdbId,
  isLoading,
  onSearchQueryChange,
  onYearChange,
  onImdbIdChange,
  onSearch,
}: SearchFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          type="text"
          placeholder="Movie title"
          value={searchQuery}
          onChange={(e) => onSearchQueryChange(e.target.value)}
          className="bg-white/5 border-white/10"
        />
        <Input
          type="text"
          placeholder="Year (optional)"
          value={year}
          onChange={(e) => onYearChange(e.target.value)}
          className="bg-white/5 border-white/10"
        />
        <Input
          type="text"
          placeholder="IMDb ID (optional)"
          value={imdbId}
          onChange={(e) => onImdbIdChange(e.target.value)}
          className="bg-white/5 border-white/10"
        />
      </div>
      <Button
        type="submit"
        disabled={isLoading || (!searchQuery && !imdbId)}
        className="w-full gap-2"
      >
        <Search className="w-4 h-4" />
        {isLoading ? "Searching..." : "Search"}
      </Button>
    </form>
  );
}
