"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDebugLogs } from "@/hooks/use-debug-logs";
import { DevNav } from "@/components/dev-nav";
import { DebugPanel } from "@/components/dev-tools/debug-panel";
import WebTorrent from "webtorrent";
import { VideoPlayer } from "@/components/video-player";

interface TorrentState {
  infoHash: string;
  name: string;
  progress: number;
  downloadSpeed: number;
  numPeers: number;
  status: "connecting" | "buffering" | "ready" | "error";
  error?: string;
}

interface TorrentFile {
  name: string;
  length: number;
  path: string;
  appendTo: (element: HTMLElement) => void;
}

interface Wire {
  peerId: string;
  remoteAddress: string;
}

// Client-side only wrapper component
const ClientOnly = ({ children }: { children: React.ReactNode }) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient ? children : null;
};

// Dynamically import VideoPlayer
const DynamicVideoPlayer = dynamic(() => Promise.resolve(VideoPlayer), {
  ssr: false,
});

export default function TorrentStreamerPage() {
  const searchParams = useSearchParams();
  const { addLog } = useDebugLogs();
  const [torrentState, setTorrentState] = useState<TorrentState | null>(null);
  const clientRef = useRef<WebTorrent.Instance | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const initTorrent = async () => {
      try {
        // Initialize WebTorrent client
        if (!clientRef.current) {
          clientRef.current = new WebTorrent({
            maxConns: 100,
            webSeeds: true,
            tracker: {
              rtcConfig: {
                iceServers: [
                  { urls: "stun:stun.l.google.com:19302" },
                  { urls: "stun:global.stun.twilio.com:3478" },
                ],
                sdpSemantics: "unified-plan",
              },
            },
          });
          addLog("WebTorrent client initialized with WebRTC config");
        }

        // Get magnet URI from URL
        const magnet = searchParams.get("magnet");
        if (!magnet || !clientRef.current) return;

        addLog(`Starting torrent download with magnet: ${magnet}`);
        setTorrentState({
          infoHash: "",
          name: "Connecting...",
          progress: 0,
          downloadSpeed: 0,
          numPeers: 0,
          status: "connecting",
        });

        // Add the torrent with WebRTC trackers
        const torrent = clientRef.current.add(magnet, {
          announce: [
            "wss://tracker.openwebtorrent.com",
            "wss://tracker.btorrent.xyz",
            "wss://tracker.files.fm:7073/announce",
            "wss://tracker.webtorrent.dev",
            "wss://tracker.fastcast.nz",
            "wss://peertube.cpy.re:443/tracker/socket",
            "wss://tube.privacytools.io:443/tracker/socket",
            "wss://tracker.sloppyta.co:443/announce",
            "wss://tracker.files.fm:7073/announce",
            "wss://open.tube:443/tracker/socket",
            "wss://tracker.lab.vvc.niif.hu:443/announce",
            "wss://tracker.files.fm:7073/announce",
          ],
          maxWebConns: 100,
          private: false,
          strategy: "sequential",
        });

        // Log initial torrent info
        addLog(`Initial torrent info:
- InfoHash: ${torrent.infoHash}
- Magnet URI: ${torrent.magnetURI}
- Initial Peers: ${torrent.numPeers}
- Trackers: ${torrent.announce.length}`);

        // Handle torrent events
        torrent.on("infoHash", () => {
          addLog(`Got infohash: ${torrent.infoHash}`);
          setTorrentState((prev) => ({
            ...prev!,
            infoHash: torrent.infoHash,
          }));
        });

        torrent.on("metadata", () => {
          addLog(`Got metadata:
- Name: ${torrent.name}
- Size: ${(torrent.length / (1024 * 1024)).toFixed(2)} MB
- Files: ${torrent.files.length}
- Pieces: ${torrent.pieces?.length || 0}
- Piece Length: ${(torrent.pieceLength / 1024).toFixed(2)} KB`);

          setTorrentState((prev) => ({
            ...prev!,
            name: torrent.name,
            status: "buffering",
          }));

          // Find the largest video file
          const videoFile = torrent.files.reduce(
            (largest: TorrentFile | null, file: TorrentFile) => {
              const isVideo = file.name.match(/\.(mp4|mkv|avi|mov|wmv)$/i);
              return isVideo && (!largest || file.length > largest.length)
                ? file
                : largest;
            },
            null
          );

          if (!videoFile) {
            addLog("No video file found in torrent", "error");
            setTorrentState((prev) => ({
              ...prev!,
              status: "error",
              error: "No video file found",
            }));
            return;
          }

          addLog(`Found video file:
- Name: ${videoFile.name}
- Size: ${(videoFile.length / (1024 * 1024)).toFixed(2)} MB
- Path: ${videoFile.path}`);

          // Stream the video file
          if (videoRef.current) {
            videoFile.appendTo(videoRef.current);
          }

          // Start buffering with more frequent updates
          let lastProgress = 0;
          const updateInterval = setInterval(() => {
            const progress = torrent.progress;
            const downloadSpeed = torrent.downloadSpeed;
            const numPeers = torrent.numPeers;
            const uploaded = torrent.uploaded;
            const downloaded = torrent.downloaded;
            const ratio = torrent.ratio;

            setTorrentState((prev) => ({
              ...prev!,
              progress,
              downloadSpeed,
              numPeers,
              status: progress > 0.1 ? "ready" : "buffering",
            }));

            if (progress - lastProgress > 0.01) {
              addLog(
                `Torrent Status:
- Progress: ${(progress * 100).toFixed(1)}%
- Speed: ${(downloadSpeed / (1024 * 1024)).toFixed(2)} MB/s
- Peers: ${numPeers}
- Downloaded: ${(downloaded / (1024 * 1024)).toFixed(2)} MB
- Uploaded: ${(uploaded / (1024 * 1024)).toFixed(2)} MB
- Ratio: ${ratio.toFixed(2)}`
              );
              lastProgress = progress;
            }
          }, 1000);

          // Cleanup interval
          return () => clearInterval(updateInterval);
        });

        // Additional event handlers for better debugging
        torrent.on("download", (bytes: number) => {
          addLog(`Downloaded chunk: ${(bytes / 1024).toFixed(2)} KB`);
        });

        torrent.on("upload", (bytes: number) => {
          addLog(`Uploaded chunk: ${(bytes / 1024).toFixed(2)} KB`);
        });

        torrent.on("wire", (wire: Wire) => {
          addLog(`New peer connected: ${wire.remoteAddress} (${wire.peerId})`);
        });

        torrent.on("noPeers", (announceType: string) => {
          addLog(`No peers available (${announceType})`, "warning");
        });

        torrent.on("error", (err: Error) => {
          addLog(`Torrent error: ${err.message}`, "error");
          setTorrentState((prev) => ({
            ...prev!,
            status: "error",
            error: err.message,
          }));
        });
      } catch (error) {
        addLog(`Failed to initialize WebTorrent: ${error}`, "error");
      }
    };

    if (typeof window !== "undefined") {
      initTorrent();
    }

    return () => {
      if (clientRef.current) {
        clientRef.current.destroy();
        clientRef.current = null;
        addLog("WebTorrent client destroyed");
      }
    };
  }, [searchParams, addLog]);

  return (
    <div className="min-h-screen bg-black">
      <DevNav />
      <DebugPanel />

      <div className="container mx-auto p-8 space-y-8">
        <Card className="bg-black/50 backdrop-blur border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-4">
              <span>Torrent Streamer</span>
              {torrentState?.status === "buffering" && (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {torrentState?.status === "error" ? (
              <div className="text-red-500">{torrentState.error}</div>
            ) : (
              <div className="space-y-4">
                <ClientOnly>
                  <Suspense
                    fallback={
                      <div className="aspect-video bg-black/50 rounded-lg" />
                    }
                  >
                    <DynamicVideoPlayer videoRef={videoRef} />
                  </Suspense>
                </ClientOnly>

                {/* Torrent Info */}
                {torrentState && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-white/60">Status</div>
                      <div className="font-medium">{torrentState.status}</div>
                    </div>
                    <div>
                      <div className="text-white/60">Progress</div>
                      <div className="font-medium">
                        {(torrentState.progress * 100).toFixed(1)}%
                      </div>
                    </div>
                    <div>
                      <div className="text-white/60">Download Speed</div>
                      <div className="font-medium">
                        {(torrentState.downloadSpeed / 1024 / 1024).toFixed(2)}{" "}
                        MB/s
                      </div>
                    </div>
                    <div>
                      <div className="text-white/60">Peers</div>
                      <div className="font-medium">{torrentState.numPeers}</div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
