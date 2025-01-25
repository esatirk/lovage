"use client";

import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  PlayCircle,
  StopCircle,
  Download,
  Upload,
  Users,
  Timer,
  Info,
  AlertCircle,
  Clock,
  Copy,
} from "lucide-react";
import { DevNav } from "@/components/dev-nav";
import { motion, AnimatePresence } from "framer-motion";
import WebTorrent from "webtorrent";
import { formatBytes, formatDuration, formatSpeed } from "@/lib/utils";
import { useSearchParams } from "next/navigation";

// Connection timeout in milliseconds
const CONNECTION_TIMEOUT = 120000; // 2 minutes

// Default magnet URI (Sintel)
const DEFAULT_MAGNET =
  "magnet:?xt=urn:btih:08ada5a7a6183aae1e09d831df6748d566095a10&dn=Sintel&tr=udp%3A%2F%2Fexplodie.org%3A6969&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.empire-js.us%3A1337&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.fastcast.nz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com&ws=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2F&xs=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2Fsintel.torrent";

interface TorrentState {
  infoHash: string;
  magnetURI: string;
  name: string;
  progress: number;
  downloadSpeed: number;
  uploadSpeed: number;
  numPeers: number;
  timeRemaining: number;
  downloaded: number;
  uploaded: number;
  ratio: number;
  length: number;
  status: "connecting" | "downloading" | "streaming" | "error" | "stopped";
  error?: string;
}

interface LogEntry {
  timestamp: Date;
  type: "info" | "warning" | "error" | "success";
  message: string;
}

interface PerformanceMetrics {
  startTime: number;
  metadataTime?: number;
  firstByteTime?: number;
  streamReadyTime?: number;
}

export default function StreamTest() {
  const searchParams = useSearchParams();
  const [magnetURI, setMagnetURI] = useState(DEFAULT_MAGNET);
  const [torrentState, setTorrentState] = useState<TorrentState | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [showPlayer, setShowPlayer] = useState(false);
  const [performance, setPerformance] = useState<PerformanceMetrics>({
    startTime: 0,
    metadataTime: 0,
    streamReadyTime: 0,
    firstByteTime: 0,
  });
  const clientRef = useRef<WebTorrent.Instance | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const torrentRef = useRef<WebTorrent.Torrent | null>(null);
  const connectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const addLog = (type: LogEntry["type"], message: string) => {
    console.log(`[${type.toUpperCase()}] ${message}`);
    setLogs((prev) => [{ timestamp: new Date(), type, message }, ...prev]);
  };

  const updatePerformance = (metric: Partial<PerformanceMetrics>) => {
    setPerformance((prev) => ({
      ...prev,
      ...metric,
    }));
  };

  // Handle URL parameters
  useEffect(() => {
    const magnet = searchParams.get("magnet");
    if (magnet) {
      setMagnetURI(decodeURIComponent(magnet));
      // Auto-start streaming if magnet is provided via URL
      if (clientRef.current) {
        handleStream(decodeURIComponent(magnet));
      }
    }
  }, [searchParams, clientRef.current]);

  useEffect(() => {
    if (typeof window !== "undefined" && !clientRef.current) {
      addLog("info", "Initializing WebTorrent client...");
      clientRef.current = new WebTorrent({
        tracker: {
          announce: [
            "wss://tracker.openwebtorrent.com",
            "wss://tracker.btorrent.xyz",
            "wss://tracker.files.fm:7073/announce",
            "wss://tracker.webtorrent.dev",
            "wss://tracker.openwebtorrent.com:443/announce",
            "wss://tracker.webtorrent.dev:443/announce",
            "wss://tracker.magnetico.org:443/announce",
            "wss://spacetradersapi-chatbox.herokuapp.com:443/announce",
            "wss://tracker.neilalexander.dev:443/announce",
            "wss://peertube.cpy.re:443/tracker/socket",
          ],
        },
        dht: {
          bootstrap: [
            "dht.libtorrent.org:25401",
            "router.bittorrent.com:6881",
            "router.utorrent.com:6881",
            "dht.transmissionbt.com:6881",
            "dht.aelitis.com:6881",
          ],
        },
        webSeeds: true,
        maxConns: 150,
        uploadLimit: 102400,
      });

      // Add custom trackers to all torrents
      clientRef.current.on("torrent", (torrent) => {
        // Add more trackers to improve peer discovery
        torrent.announce.push(
          "wss://tracker.openwebtorrent.com",
          "wss://tracker.btorrent.xyz",
          "wss://tracker.files.fm:7073/announce",
          "wss://tracker.webtorrent.dev",
          "wss://tracker.openwebtorrent.com:443/announce",
          "wss://tracker.webtorrent.dev:443/announce",
          "wss://tracker.magnetico.org:443/announce",
          "wss://spacetradersapi-chatbox.herokuapp.com:443/announce",
          "wss://tracker.neilalexander.dev:443/announce",
          "wss://peertube.cpy.re:443/tracker/socket"
        );
      });

      clientRef.current.on("error", (err: Error | string) => {
        addLog(
          "error",
          `Client error: ${err instanceof Error ? err.message : err}`
        );
      });

      // If magnet URI is already set (from URL params), start streaming
      const magnet = searchParams.get("magnet");
      if (magnet) {
        handleStream(decodeURIComponent(magnet));
      }
    }

    return () => {
      if (clientRef.current) {
        addLog("info", "Destroying WebTorrent client...");
        clientRef.current.destroy();
      }
    };
  }, []);

  const handleStream = async (magnetURIParam?: string | React.MouseEvent) => {
    const uriToUse =
      typeof magnetURIParam === "string" ? magnetURIParam : magnetURI;
    if (!uriToUse.trim() || !clientRef.current) return;

    try {
      // Reset state
      setShowPlayer(false);
      setPerformance({
        startTime: Date.now(),
        metadataTime: 0,
        streamReadyTime: 0,
        firstByteTime: 0,
      });

      // Stop any existing torrent
      if (torrentRef.current) {
        addLog("info", "Stopping previous torrent...");
        torrentRef.current.destroy();
        torrentRef.current = null;
        setTorrentState(null);
      }

      // Clear any existing timeout
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current);
      }

      // Set connection timeout
      connectionTimeoutRef.current = setTimeout(() => {
        if (torrentState?.status === "connecting") {
          addLog("error", "Connection timeout - no peers found");
          setTorrentState((prev) =>
            prev
              ? {
                  ...prev,
                  status: "error",
                  error: "Connection timeout - no peers found",
                }
              : null
          );
          if (torrentRef.current) {
            torrentRef.current.destroy();
            torrentRef.current = null;
          }
        }
      }, CONNECTION_TIMEOUT);

      addLog("info", "Adding torrent...");
      setTorrentState({
        infoHash: "",
        magnetURI: uriToUse,
        name: "Connecting...",
        progress: 0,
        downloadSpeed: 0,
        uploadSpeed: 0,
        numPeers: 0,
        timeRemaining: 0,
        downloaded: 0,
        uploaded: 0,
        ratio: 0,
        length: 0,
        status: "connecting",
      });

      const torrent = clientRef.current.add(uriToUse, {
        announce: [
          "wss://tracker.openwebtorrent.com",
          "wss://tracker.btorrent.xyz",
          "wss://tracker.files.fm:7073/announce",
          "wss://tracker.webtorrent.dev",
          "wss://tracker.openwebtorrent.com:443/announce",
          "wss://tracker.webtorrent.dev:443/announce",
          "wss://tracker.magnetico.org:443/announce",
          "wss://spacetradersapi-chatbox.herokuapp.com:443/announce",
          "wss://tracker.neilalexander.dev:443/announce",
          "wss://peertube.cpy.re:443/tracker/socket",
        ],
        maxWebConns: 75,
        path: ".",
        strategy: "sequential",
      });
      torrentRef.current = torrent;

      // Clear timeout when we get peers
      torrent.on("wire", () => {
        if (connectionTimeoutRef.current) {
          clearTimeout(connectionTimeoutRef.current);
          connectionTimeoutRef.current = null;
        }
      });

      torrent.on("infoHash", () => {
        addLog("info", `Got infohash: ${torrent.infoHash}`);
      });

      torrent.on("metadata", () => {
        const metadataTime = Date.now() - performance.startTime;
        updatePerformance({ metadataTime });
        addLog(
          "success",
          `Got metadata in ${metadataTime}ms. Files found: ${torrent.files.length}`
        );

        // Find the largest video file
        const videoFile = torrent.files.reduce(
          (largest, file) => {
            const isVideo = file.name.match(/\.(mp4|mkv|avi|mov|wmv)$/i);
            return isVideo && (!largest || file.length > largest.length)
              ? file
              : largest;
          },
          null as WebTorrent.TorrentFile | null
        );

        if (!videoFile) {
          addLog("error", "No video file found in torrent");
          return;
        }

        addLog(
          "info",
          `Selected video file: ${videoFile.name} (${formatBytes(videoFile.length)})`
        );

        // Set streaming mode and prioritize initial pieces
        videoFile.select();
        videoFile.on("download", (bytes: number) => {
          if (bytes > 0 && !showPlayer) {
            setShowPlayer(true);
            addLog("info", "Starting video playback...");
          }
        });

        // Stream to video element
        if (videoRef.current) {
          videoFile.getBlobURL(
            (err: string | Error | undefined, url?: string) => {
              if (err) {
                addLog(
                  "error",
                  `Failed to create stream: ${err instanceof Error ? err.message : err}`
                );
                return;
              }
              if (url && videoRef.current) {
                videoRef.current.src = url;
                videoRef.current.style.display = "block";
                setShowPlayer(true);
                const streamReadyTime = Date.now() - performance.startTime;
                updatePerformance({ streamReadyTime });
                addLog("info", `Stream ready in ${streamReadyTime}ms`);

                videoRef.current.addEventListener(
                  "loadeddata",
                  () => {
                    const newFirstByteTime = Date.now() - performance.startTime;
                    updatePerformance({ firstByteTime: newFirstByteTime });
                    addLog(
                      "success",
                      `First byte received in ${newFirstByteTime}ms`
                    );
                  },
                  { once: true }
                );
              }
            }
          );
        }
      });

      torrent.on("ready", () => {
        addLog("success", "Torrent ready to stream");
      });

      torrent.on("download", () => {
        if (torrent) {
          setTorrentState({
            infoHash: torrent.infoHash,
            magnetURI: torrent.magnetURI,
            name: torrent.name,
            progress: torrent.progress,
            downloadSpeed: torrent.downloadSpeed,
            uploadSpeed: torrent.uploadSpeed,
            numPeers: torrent.numPeers,
            timeRemaining: torrent.timeRemaining,
            downloaded: torrent.downloaded,
            uploaded: torrent.uploaded,
            ratio: torrent.ratio,
            length: torrent.length,
            status: "downloading",
          });
        }
      });

      torrent.on("done", () => {
        addLog("success", "Download completed!");
      });

      // Handle error and warning events
      torrent.on("error", (err: Error | string) => {
        const errorMessage = err instanceof Error ? err.message : err;
        addLog("error", `Torrent error: ${errorMessage}`);
        setTorrentState((prev) =>
          prev ? { ...prev, status: "error", error: errorMessage } : null
        );
      });

      torrent.on("warning", (err: Error | string) => {
        const errorMessage = err instanceof Error ? err.message : err;
        addLog("warning", `Torrent warning: ${errorMessage}`);
      });

      // Add more event listeners for debugging
      torrent.on("peer", () => {
        addLog("info", `Found peer: ${torrent.numPeers} total`);
      });

      torrent.on("upload", () => {
        addLog("info", `Upload speed: ${formatSpeed(torrent.uploadSpeed)}`);
      });

      torrent.on("download", () => {
        addLog("info", `Download speed: ${formatSpeed(torrent.downloadSpeed)}`);
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      addLog("error", `Failed to add torrent: ${errorMessage}`);
      setTorrentState((prev) =>
        prev ? { ...prev, status: "error", error: errorMessage } : null
      );
    }
  };

  const handleStop = () => {
    if (torrentRef.current) {
      addLog("info", "Stopping torrent...");
      torrentRef.current.destroy();
      torrentRef.current = null;
      setTorrentState((prev) => (prev ? { ...prev, status: "stopped" } : null));
    }
  };

  return (
    <main className="min-h-screen bg-black p-8">
      <DevNav />

      <div className="container mx-auto space-y-8 pt-8">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle>Stream Torrent</CardTitle>
            <CardDescription>
              Enter a magnet URI to start streaming
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Input
                placeholder="magnet:?xt=urn:btih:..."
                value={magnetURI}
                onChange={(e) => setMagnetURI(e.target.value)}
                className="font-mono text-sm"
              />
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={handleStream}
                      disabled={
                        !magnetURI.trim() ||
                        torrentState?.status === "connecting"
                      }
                      className="w-32"
                    >
                      {torrentState?.status === "connecting" ? (
                        "Connecting..."
                      ) : (
                        <>
                          <PlayCircle className="mr-2 h-4 w-4" />
                          Stream
                        </>
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Start streaming the torrent</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              {torrentState && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="destructive"
                        onClick={handleStop}
                        className="w-32"
                      >
                        <StopCircle className="mr-2 h-4 w-4" />
                        Stop
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Stop and remove the torrent</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Torrent Info */}
        {torrentState && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  Torrent Status
                  <Badge
                    variant={
                      torrentState.status === "error"
                        ? "destructive"
                        : torrentState.status === "streaming"
                          ? "default"
                          : "secondary"
                    }
                  >
                    {torrentState.status}
                  </Badge>
                </CardTitle>
                {torrentState.status === "error" && (
                  <Badge variant="destructive" className="h-auto py-1">
                    <AlertCircle className="mr-2 h-4 w-4" />
                    {torrentState.error}
                  </Badge>
                )}
              </div>
              <CardDescription>
                {torrentState.name || "Loading..."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{Math.round(torrentState.progress * 100)}%</span>
                </div>
                <Progress value={torrentState.progress * 100} />
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <Download className="h-4 w-4 text-green-500" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Download Speed</p>
                    <p className="text-xl font-mono">
                      {formatSpeed(torrentState.downloadSpeed)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Upload className="h-4 w-4 text-blue-500" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Upload Speed</p>
                    <p className="text-xl font-mono">
                      {formatSpeed(torrentState.uploadSpeed)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-purple-500" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Connected Peers</p>
                    <p className="text-xl font-mono">{torrentState.numPeers}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Timer className="h-4 w-4 text-yellow-500" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Time Remaining</p>
                    <p className="text-xl font-mono">
                      {formatDuration(torrentState.timeRemaining)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Detailed Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="space-y-1">
                  <p className="text-muted-foreground">Downloaded</p>
                  <p className="font-mono">
                    {formatBytes(torrentState.downloaded)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground">Uploaded</p>
                  <p className="font-mono">
                    {formatBytes(torrentState.uploaded)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground">Share Ratio</p>
                  <p className="font-mono">{torrentState.ratio.toFixed(2)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground">Total Size</p>
                  <p className="font-mono">
                    {formatBytes(torrentState.length)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Performance Metrics */}
        {performance && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Performance Metrics
              </CardTitle>
              <CardDescription>
                Timing measurements for various operations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Metadata Time</p>
                  <p className="text-xl font-mono">
                    {performance.metadataTime
                      ? `${performance.metadataTime}ms`
                      : "..."}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">First Byte</p>
                  <p className="text-xl font-mono">
                    {performance.firstByteTime
                      ? `${performance.firstByteTime}ms`
                      : "..."}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Stream Ready</p>
                  <p className="text-xl font-mono">
                    {performance.streamReadyTime
                      ? `${performance.streamReadyTime}ms`
                      : "..."}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Total Time</p>
                  <p className="text-xl font-mono">
                    {performance.firstByteTime
                      ? `${performance.firstByteTime}ms`
                      : "..."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Debug Logs */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Debug Logs
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const logText = logs
                    .map(
                      (log) =>
                        `${log.timestamp.toLocaleTimeString()}\n${log.message}`
                    )
                    .join("\n");
                  navigator.clipboard.writeText(logText);
                }}
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy Logs
              </Button>
            </div>
            <CardDescription>
              Real-time updates and debugging information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 font-mono text-sm max-h-[300px] overflow-y-auto">
              {logs.map((log, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-2 p-2 rounded ${
                    log.type === "error"
                      ? "bg-red-500/10 text-red-500"
                      : log.type === "warning"
                        ? "bg-yellow-500/10 text-yellow-500"
                        : log.type === "success"
                          ? "bg-green-500/10 text-green-500"
                          : "bg-blue-500/10 text-blue-500"
                  }`}
                >
                  <span className="whitespace-nowrap">
                    {log.timestamp.toLocaleTimeString()}
                  </span>
                  <span>{log.message}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Files List */}
        {torrentState && torrentRef.current?.files && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Files ({torrentRef.current.files.length})
              </CardTitle>
              <CardDescription>List of files in the torrent</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {torrentRef.current.files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 rounded bg-accent/50"
                  >
                    <div className="space-y-1">
                      <p className="font-medium">{file.name}</p>
                      <div className="text-sm text-muted-foreground">
                        Size: {formatBytes(file.length)} • Progress:{" "}
                        {Math.round(file.progress * 100)}%
                      </div>
                    </div>
                    <Progress value={file.progress * 100} className="w-32" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Metadata Details */}
        {torrentRef.current && (
          <Card>
            <CardHeader>
              <CardTitle>Metadata Details</CardTitle>
              <CardDescription>
                Technical details about the torrent
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium">Info Hash</p>
                  <p className="font-mono text-muted-foreground">
                    {torrentRef.current.infoHash}
                  </p>
                </div>
                <div>
                  <p className="font-medium">Piece Length</p>
                  <p className="font-mono text-muted-foreground">
                    {formatBytes(torrentRef.current.pieceLength)}
                  </p>
                </div>
                <div>
                  <p className="font-medium">Total Pieces</p>
                  <p className="font-mono text-muted-foreground">
                    {torrentRef.current.pieces?.length || 0}
                  </p>
                </div>
                <div>
                  <p className="font-medium">Creation Date</p>
                  <p className="font-mono text-muted-foreground">
                    {torrentRef.current.created?.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="font-medium">Comment</p>
                  <p className="font-mono text-muted-foreground">
                    {torrentRef.current.comment || "None"}
                  </p>
                </div>
                <div>
                  <p className="font-medium">Created By</p>
                  <p className="font-mono text-muted-foreground">
                    {torrentRef.current.createdBy || "Unknown"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Video Player - Moved to bottom */}
        <AnimatePresence>
          {showPlayer && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="overflow-hidden">
                <video
                  ref={videoRef}
                  controls
                  autoPlay
                  className="w-full aspect-video bg-black"
                  style={{ display: "block" }}
                />
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
