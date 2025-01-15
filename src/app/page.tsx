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
import Image from "next/image";

interface IconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/lovage-bar-and-club.jpg"
          alt="Lovage background"
          fill
          className="object-cover brightness-[0.3]"
          priority
          quality={100}
        />
      </div>

      {/* Dev Menu */}
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
              <Link href="/streamtest">Stream Test</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-20 min-h-screen flex flex-col items-center justify-center text-center">
        <h1 className="text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
          Lovage
        </h1>
        <p className="text-xl text-white/80 mb-12 max-w-2xl">
          A modern streaming platform that brings your favorite movies and TV
          shows right to your screen. Built with cutting-edge technology for the
          best viewing experience.
        </p>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl w-full mt-12">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-colors"
            >
              <feature.icon className="w-8 h-8 mb-4 text-white/80" />
              <h3 className="text-lg font-semibold mb-2 text-white/90">
                {feature.title}
              </h3>
              <p className="text-sm text-white/70">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Coming Soon Badge */}
        <div className="mt-16 inline-block px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
          <span className="text-sm text-white/80">Coming Soon</span>
        </div>
      </div>
    </main>
  );
}

const features = [
  {
    title: "Stream Instantly",
    description:
      "Start watching your favorite content immediately with our advanced streaming technology.",
    icon: (props: IconProps) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
      >
        <polygon points="5 3 19 12 5 21 5 3" />
      </svg>
    ),
  },
  {
    title: "Beautiful Interface",
    description:
      "Enjoy a modern, intuitive interface designed for the best user experience.",
    icon: (props: IconProps) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
      >
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
  },
  {
    title: "Extensive Library",
    description:
      "Access a vast collection of movies and TV shows from various genres.",
    icon: (props: IconProps) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
      >
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    ),
  },
];
