"use client";

import Link from "next/link";
import { Github, Twitter } from "lucide-react";

const footerLinks = [
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Help Center", href: "/help" },
      { label: "Contact", href: "/contact" },
    ],
  },
] as const;

const socialLinks = [
  { icon: Github, href: "https://github.com", label: "GitHub" },
  { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
] as const;

export function Footer() {
  return (
    <footer className="relative mt-24 border-t border-white/10">
      {/* Glass Background */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-xl -z-10" />

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 mb-8">
          {/* Logo and Description */}
          <div className="col-span-2 md:col-span-1">
            <h2 className="text-xl font-bold mb-4">Lovage</h2>
            <p className="text-sm text-white/60 max-w-xs">
              Your ultimate destination for discovering and enjoying movies.
            </p>
          </div>

          {/* Footer Links */}
          {footerLinks.map((section) => (
            <div key={section.title}>
              <h3 className="font-medium mb-4">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/60 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-white/10">
          <div className="flex items-center gap-2 text-sm text-white/60 mb-4 md:mb-0">
            <span>© 2024</span>
            <span>•</span>
            <span>Created by</span>
            <Link
              href="https://github.com/esatirk"
              className="hover:text-white transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              @esatirk
            </Link>
            <span>&</span>
            <Link
              href="https://github.com/korayelmulk"
              className="hover:text-white transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              @korayelmulk
            </Link>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-4">
            {socialLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <link.icon className="w-5 h-5" />
                <span className="sr-only">{link.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
