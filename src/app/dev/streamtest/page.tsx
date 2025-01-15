"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import dynamic from "next/dynamic";

// Default magnet link for testing (Sintel)
const DEFAULT_MAGNET =
  "magnet:?xt=urn:btih:08ada5a7a6183aae1e09d831df6748d566095a10&dn=Sintel&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com&tr=wss%3A%2F%2Ftracker.fastcast.nz";

const VideoPlayer = dynamic(
  () =>
    Promise.resolve(
      ({ ...props }: React.VideoHTMLAttributes<HTMLVideoElement>) => (
        <video {...props} />
      )
    ),
  { ssr: false }
);

export default function StreamTestPage() {
  const [magnetLink, setMagnetLink] = useState(DEFAULT_MAGNET);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState<string | null>(null);
  const clientRef = useRef<any>(null);
  const [showPlayer, setShowPlayer] = useState(false);

  useEffect(() => {
    const initClient = async () => {
      try {
        const WebTorrent = (await import("webtorrent")).default;
        clientRef.current = new WebTorrent();
      } catch (err) {
        console.error("Failed to initialize WebTorrent:", err);
        setError("Failed to initialize WebTorrent client");
      }
    };

    initClient();

    return () => {
      if (clientRef.current) {
        clientRef.current.destroy();
      }
    };
  }, []);

  const handleStream = async () => {
    if (!clientRef.current) {
      setError("WebTorrent client not initialized");
      return;
    }

    try {
      setStatus("connecting");
      setError(null);
      setShowPlayer(false);

      // Remove existing torrents
      clientRef.current.torrents.forEach((t: any) => t.destroy());

      clientRef.current.add(magnetLink, (torrent: any) => {
        console.log("Client is downloading:", torrent.infoHash);
        setStatus("downloading");

        const file = torrent.files.find(
          (f: any) =>
            f.name.endsWith(".mp4") ||
            f.name.endsWith(".mkv") ||
            f.name.endsWith(".avi")
        );

        if (!file) {
          setError("No video file found in torrent");
          return;
        }

        console.log("Found video file:", file.name);
        setShowPlayer(true);

        file.getBlobURL((err: Error | null, url?: string) => {
          if (err) {
            console.error("Failed to get blob URL:", err);
            setError("Failed to create video stream");
            return;
          }
          if (url) {
            console.log("Created blob URL for video");
            const videoElement = document.querySelector(
              "#video-player"
            ) as HTMLVideoElement;
            if (videoElement) {
              videoElement.src = url;
              videoElement.load();
              setStatus("streaming");
              console.log("Video source updated, attempting playback");
            }
          }
        });

        torrent.on("download", () => {
          const progress = (torrent.progress * 100).toFixed(1);
          console.log(`Progress: ${progress}%`);
        });
      });
    } catch (err) {
      console.error("Stream error:", err);
      setError(err instanceof Error ? err.message : "Unknown error occurred");
      setStatus("error");
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold">Stream Test</h1>

      <div className="space-y-2">
        <Input
          value={magnetLink}
          onChange={(e) => setMagnetLink(e.target.value)}
          placeholder="Enter magnet link..."
          className="w-full"
        />
        <Button
          onClick={handleStream}
          className="w-full"
          disabled={status === "connecting"}
        >
          {status === "connecting" ? "Connecting..." : "Stream"}
        </Button>
        {error && <div className="text-red-500 text-sm">{error}</div>}
        {status !== "idle" && !error && (
          <div className="text-sm">Status: {status}</div>
        )}
      </div>

      <div id="video-container">
        {showPlayer && (
          <VideoPlayer
            id="video-player"
            controls
            className="w-full aspect-video bg-black rounded-lg"
          />
        )}
      </div>
    </div>
  );
}
