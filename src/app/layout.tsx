import type { Metadata } from "next";
import { Inter, Montserrat } from "next/font/google";
import "./globals.css";
import { DevNav } from "@/components/dev-nav";

const inter = Inter({ subsets: ["latin"] });
const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
});

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
      <body
        className={`${inter.className} ${montserrat.variable} min-h-screen bg-background`}
      >
        <DevNav />
        {children}
      </body>
    </html>
  );
}
