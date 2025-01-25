"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Code2 } from "lucide-react";
import Link from "next/link";

export function DevNav() {
  return (
    <div className="fixed top-4 right-4 z-50">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="bg-background/20 backdrop-blur-sm border-white/10 hover:bg-background/30"
          >
            <Code2 className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href="/">Home</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/dev/torrent-search-engine">Torrent Search</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/dev/streamtest">Stream Test</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/dev/tmdb-test">TMDB Test</Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
