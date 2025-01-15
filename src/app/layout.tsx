import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { DevNav } from "@/components/dev-nav";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Lovage - Stream Movies & TV Shows",
  description: "A modern streaming platform for movies and TV shows",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen bg-background`}>
        <DevNav />
        {children}
      </body>
    </html>
  );
}
