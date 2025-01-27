"use client";

import { forwardRef } from "react";

interface VideoPlayerProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
}

export const VideoPlayer = forwardRef<
  HTMLVideoElement | null,
  VideoPlayerProps
>(({ videoRef }) => {
  return (
    <div className="relative aspect-video rounded-lg overflow-hidden bg-black/50">
      <video
        ref={videoRef}
        controls
        autoPlay
        className="absolute inset-0 w-full h-full"
      />
    </div>
  );
});

VideoPlayer.displayName = "VideoPlayer";
