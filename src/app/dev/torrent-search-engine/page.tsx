"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search,
  Copy,
  ExternalLink,
  Play,
  Check,
  Download,
  ArrowUpDown,
  Filter,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useInView } from "react-intersection-observer";

interface TorrentResult {
  name: string;
  size: string;
  seeders: number;
  leechers: number;
  magnet?: string;
  link?: string;
  source: string;
  url: string;
}

type SourceType = "YTS" | "PirateBay";
type EnabledSources = Record<SourceType, boolean>;
type SortField = "seeders" | "leechers" | "size" | "name";
type SortOrder = "asc" | "desc";

const ITEMS_PER_PAGE = 20;

export default function TorrentSearchPage() {
  const [query, setQuery] = useState("");
  const [allResults, setAllResults] = useState<TorrentResult[]>([]);
  const [displayedResults, setDisplayedResults] = useState<TorrentResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [enabledSources, setEnabledSources] = useState<EnabledSources>({
    YTS: true,
    PirateBay: true,
  });
  const [sortField, setSortField] = useState<SortField>("seeders");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [minSeeders, setMinSeeders] = useState(0);
  const [page, setPage] = useState(1);
  const { ref, inView } = useInView();

  const searchTorrents = async (
    searchQuery: string
  ): Promise<TorrentResult[]> => {
    try {
      const providers = Object.entries(enabledSources)
        .filter(([, enabled]) => enabled)
        .map(([provider]) => provider);

      const response = await fetch(
        `/api/search?query=${encodeURIComponent(searchQuery)}&providers=${providers.join(",")}`
      );

      if (!response.ok) {
        throw new Error("Search failed");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error searching torrents:", error);
      return [];
    }
  };

  const handleCopy = async (magnet: string, index: number) => {
    try {
      await navigator.clipboard.writeText(magnet);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const handleDownload = (result: TorrentResult) => {
    if (result.link && !result.magnet) {
      window.location.href = result.link;
    } else if (result.magnet) {
      window.location.href = result.magnet;
    }
  };

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setPage(1);
    try {
      const results = await searchTorrents(query);
      setAllResults(results);
      setDisplayedResults(results.slice(0, ITEMS_PER_PAGE));
    } catch (error) {
      console.error("Search failed:", error);
      setAllResults([]);
      setDisplayedResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const loadMore = () => {
    const nextPage = page + 1;
    const start = (nextPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    setDisplayedResults([...displayedResults, ...allResults.slice(start, end)]);
    setPage(nextPage);
  };

  useEffect(() => {
    if (inView && !loading && displayedResults.length < allResults.length) {
      loadMore();
    }
  }, [inView]);

  useEffect(() => {
    const sortedResults = [...allResults].sort((a, b) => {
      if (sortField === "size") {
        const aSize = parseFloat(a.size);
        const bSize = parseFloat(b.size);
        return sortOrder === "asc" ? aSize - bSize : bSize - aSize;
      }
      if (sortField === "name") {
        return sortOrder === "asc"
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      }
      return sortOrder === "asc"
        ? a[sortField] - b[sortField]
        : b[sortField] - a[sortField];
    });

    const filteredResults = sortedResults.filter(
      (result) => result.seeders >= minSeeders
    );

    setAllResults(filteredResults);
    setDisplayedResults(filteredResults.slice(0, page * ITEMS_PER_PAGE));
  }, [sortField, sortOrder, minSeeders]);

  return (
    <div className="container max-w-5xl mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Torrent Search Engine</CardTitle>
          <CardDescription>
            Search across multiple torrent sources
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search torrents..."
                className="pl-8"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch} disabled={loading}>
              {loading ? "Searching..." : "Search"}
            </Button>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                  <SheetDescription>
                    Customize your search results
                  </SheetDescription>
                </SheetHeader>
                <div className="py-4 space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Sources</h3>
                    <div className="flex flex-wrap gap-2">
                      {(
                        Object.entries(enabledSources) as [
                          SourceType,
                          boolean,
                        ][]
                      ).map(([source, enabled]) => (
                        <Button
                          key={source}
                          variant={enabled ? "default" : "outline"}
                          size="sm"
                          onClick={() =>
                            setEnabledSources((prev) => ({
                              ...prev,
                              [source]: !prev[source],
                            }))
                          }
                        >
                          {source}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Minimum Seeders</h3>
                    <Input
                      type="number"
                      min="0"
                      value={minSeeders}
                      onChange={(e) =>
                        setMinSeeders(parseInt(e.target.value) || 0)
                      }
                    />
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </CardContent>
      </Card>

      {displayedResults.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle>Search Results</CardTitle>
              <CardDescription>
                Found {allResults.length} results for &ldquo;{query}&rdquo;
              </CardDescription>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <ArrowUpDown className="mr-2 h-4 w-4" />
                  Sort by {sortField}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleSort("seeders")}>
                  Seeders{" "}
                  {sortField === "seeders" && (sortOrder === "asc" ? "↑" : "↓")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSort("leechers")}>
                  Leechers{" "}
                  {sortField === "leechers" &&
                    (sortOrder === "asc" ? "↑" : "↓")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSort("size")}>
                  Size{" "}
                  {sortField === "size" && (sortOrder === "asc" ? "↑" : "↓")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSort("name")}>
                  Name{" "}
                  {sortField === "name" && (sortOrder === "asc" ? "↑" : "↓")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {displayedResults.map((result, index) => (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border gap-4 hover:bg-accent/50 transition-colors group"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-start gap-2">
                      <button
                        onClick={() => handleDownload(result)}
                        className="font-medium text-left hover:text-primary transition-colors flex items-center gap-2 group flex-1"
                      >
                        {result.name}
                        <Download className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                      <Badge variant="secondary">{result.source}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Size: {result.size} • Seeders:{" "}
                      <span className="text-green-500">{result.seeders}</span> •
                      Leechers:{" "}
                      <span className="text-red-500">{result.leechers}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <TooltipProvider>
                      {result.magnet && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleCopy(result.magnet!, index)}
                              className="hover:text-primary transition-colors"
                            >
                              {copiedIndex === index ? (
                                <Check className="w-4 h-4" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              {copiedIndex === index
                                ? "Copied!"
                                : "Copy Magnet"}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      )}

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => window.open(result.url, "_blank")}
                            className="hover:text-primary transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Visit Official Site</p>
                        </TooltipContent>
                      </Tooltip>

                      {result.magnet && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                (window.location.href = `/dev/streamtest?magnet=${encodeURIComponent(
                                  result.magnet!
                                )}`)
                              }
                              className="hover:text-primary transition-colors"
                            >
                              <Play className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Stream</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </TooltipProvider>
                  </div>
                </div>
              ))}

              {loading &&
                Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border gap-4"
                  >
                    <div className="space-y-3 flex-1">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-8 w-8 rounded" />
                      <Skeleton className="h-8 w-8 rounded" />
                      <Skeleton className="h-8 w-8 rounded" />
                    </div>
                  </div>
                ))}

              {!loading && displayedResults.length < allResults.length && (
                <div ref={ref} className="py-4 flex justify-center">
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
