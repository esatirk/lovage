"use client";

import { Home, Compass, TrendingUp, Heart, Settings } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const navigationItems = [
  { icon: Home, label: "Home", href: "/" },
  { icon: Compass, label: "Discover", href: "/discover" },
  { icon: TrendingUp, label: "Trending", href: "/trending" },
  { icon: Heart, label: "Favorites", href: "/favorites" },
  { icon: Settings, label: "Settings", href: "/settings" },
] as const;

export function Sidebar() {
  return (
    <div className="fixed inset-y-0 left-0 w-20 bg-gradient-to-b from-black/80 via-black/40 to-black/80 backdrop-blur-xl z-50">
      <div className="absolute inset-0 bg-gradient-to-r from-white/[0.02] to-transparent opacity-50" />
      <div className="absolute inset-0 bg-grid-white/[0.01]" />

      <nav className="relative h-full flex flex-col items-center justify-center gap-8">
        {navigationItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="group relative flex items-center"
          >
            {/* Tooltip */}
            <div
              className="absolute left-16 px-3 py-2 rounded-lg bg-black/90 backdrop-blur-sm 
                          opacity-0 translate-x-2 invisible
                          group-hover:opacity-100 group-hover:translate-x-0 group-hover:visible
                          transition-all duration-200 whitespace-nowrap z-50"
            >
              <span className="text-sm font-medium text-white">
                {item.label}
              </span>
              <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 border-4 border-transparent border-r-black/90" />
            </div>

            {/* Icon Container */}
            <div
              className="relative w-20 h-12 flex items-center justify-center group-hover:text-white 
                          text-white/50 transition-colors duration-200"
            >
              <div className="absolute inset-x-6 h-12 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <div className="absolute inset-0 bg-white/5 backdrop-blur-sm rounded-xl" />
                <div className="absolute inset-0 bg-gradient-to-r from-white/[0.05] to-transparent rounded-xl" />
              </div>
              <item.icon className="relative w-6 h-6 transition-transform duration-200 group-hover:scale-110" />
            </div>
          </Link>
        ))}
      </nav>
    </div>
  );
}
