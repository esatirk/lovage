"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { Wrench } from "lucide-react";
import { useState } from "react";

const navItems = [
  {
    href: "/",
    label: "Home",
  },
  {
    href: "/dev/torrent-search-engine",
    label: "Torrent Search",
  },
  {
    href: "/dev/streamtest",
    label: "Stream Test",
  },
  {
    href: "/dev/torrent-streamer",
    label: "Torrent Streamer",
  },
];

export function DevNav() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed top-8 right-8 z-[100]">
      {/* Menu Items */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2">
          <div className="flex flex-col gap-1 items-end min-w-[180px]">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "w-full px-4 py-2.5 rounded-lg text-sm font-medium text-white/70 hover:text-white transition-colors bg-zinc-900/90 backdrop-blur-xl border border-white/10",
                  pathname === item.href &&
                    "bg-white/10 text-white border-white/20"
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-10 h-10 rounded-lg bg-zinc-900/90 backdrop-blur-xl border border-white/10 flex items-center justify-center",
          "hover:bg-white/10 hover:border-white/20 transition-all",
          isOpen && "bg-white/10 border-white/20"
        )}
      >
        <Wrench className="w-4 h-4 text-white" />
      </button>
    </div>
  );
}
