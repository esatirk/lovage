"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Heart, Settings, Film, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { TorrentTestModal } from "@/components/dev-tools/torrent-test-modal";
import { SettingsModal } from "@/components/settings/settings-modal";

const sidebarItems = [
  {
    icon: Home,
    label: "Home",
    href: "/",
  },
  {
    icon: Search,
    label: "Discover",
    href: "/discover",
  },
  {
    icon: Heart,
    label: "Favorites",
    href: "/favorites",
  },
  {
    icon: Film,
    label: "Watchlist",
    href: "/watchlist",
  },
];

// Dev-only items
const devItems = [
  {
    icon: Wrench,
    label: "Test Torrents",
    onClick: (setOpen: (open: boolean) => void) => setOpen(true),
    devOnly: true,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isTorrentTestOpen, setIsTorrentTestOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <>
      <aside className="fixed left-0 top-0 bottom-0 w-20 group hover:w-64 bg-black/50 backdrop-blur-xl border-r border-white/10 transition-[width] duration-300 z-[100]">
        {/* Navigation */}
        <nav className="flex flex-col items-center w-full h-full py-8">
          {/* Logo */}
          <div className="w-full px-6 mb-8">
            <div className="w-8 h-8 rounded-full bg-white/10" />
          </div>

          {/* Menu Items */}
          <div className="flex-1 w-full">
            {sidebarItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-4 px-6 py-3 w-full text-sm text-white/70 hover:text-white transition-colors",
                  pathname === item.href && "text-white bg-white/10"
                )}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {item.label}
                </span>
              </Link>
            ))}
          </div>

          {/* Bottom Items (Settings and Dev Tools) */}
          <div className="flex flex-col items-center w-full gap-2">
            {process.env.NODE_ENV === "development" &&
              devItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => item.onClick(setIsTorrentTestOpen)}
                  className="flex items-center gap-4 px-6 py-3 w-full text-sm text-white/70 hover:text-white transition-colors"
                >
                  <item.icon className="w-5 h-5 shrink-0" />
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {item.label}
                  </span>
                </button>
              ))}

            <button
              onClick={() => setIsSettingsOpen(true)}
              className={cn(
                "flex items-center gap-4 px-6 py-3 w-full text-sm text-white/70 hover:text-white transition-colors"
              )}
            >
              <Settings className="w-5 h-5 shrink-0" />
              <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                Settings
              </span>
            </button>
          </div>
        </nav>
      </aside>

      <TorrentTestModal
        open={isTorrentTestOpen}
        onOpenChange={setIsTorrentTestOpen}
      />

      <SettingsModal open={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
    </>
  );
}
