"use client";

import { useEffect, useRef, useState } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  RotateCcw,
  RotateCw,
  SkipForward,
} from "lucide-react";

interface VideoPlayerProps {
  video: {
    _id: string;
    videotitle: string;
    filepath: string;
  };
}

export default function VideoPlayer({ video }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [lastTap, setLastTap] = useState<{
    time: number;
    side: "left" | "right";
  } | null>(null);

  const videoUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/${video?.filepath}`;
  const togglePlay = async () => {
    const videoElement = videoRef.current;

    if (!videoElement) return;

    if (videoElement.paused) {
      await videoElement.play();
      setIsPlaying(true);
    } else {
      videoElement.pause();
      setIsPlaying(false);
    }
  };

  const seek = (seconds: number) => {
    const videoElement = videoRef.current;

    if (!videoElement) return;

    videoElement.currentTime = Math.max(
      0,
      Math.min(videoElement.currentTime + seconds, videoElement.duration || 0)
    );
  };

  const handleVolume = (value: number) => {
    const videoElement = videoRef.current;

    if (!videoElement) return;

    videoElement.volume = value;
    videoElement.muted = value === 0;

    setVolume(value);
    setIsMuted(value === 0);
  };
  const toggleMute = () => {
    const videoElement = videoRef.current;

    if (!videoElement) return;

    videoElement.muted = !videoElement.muted;
    setIsMuted(videoElement.muted);
  };

  const toggleFullscreen = async () => {
    const player = playerRef.current;

    if (!player) return;

    if (!document.fullscreenElement) {
      await player.requestFullscreen();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const formatTime = (time: number) => {
    if (!Number.isFinite(time)) return "0:00";

    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);

    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, "0")}:${String(
        seconds
      ).padStart(2, "0")}`;
    }

    return `${minutes}:${String(seconds).padStart(2, "0")}`;
  };

  useEffect(() => {
    const videoElement = videoRef.current;

    if (!videoElement) return;

    const handleLoadedMetadata = () => {
      setDuration(videoElement.duration);
      setLoading(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(videoElement.currentTime);
    };

    const handlePlay = () => {
      setIsPlaying(true);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    const handleWaiting = () => {
      setLoading(true);
    };

    const handleCanPlay = () => {
      setLoading(false);
    };

    const handleEnded = () => {
      setIsPlaying(false);
    };

    videoElement.addEventListener(
      "loadedmetadata",
      handleLoadedMetadata
    );
    videoElement.addEventListener("timeupdate", handleTimeUpdate);
    videoElement.addEventListener("play", handlePlay);
    videoElement.addEventListener("pause", handlePause);
    videoElement.addEventListener("waiting", handleWaiting);
    videoElement.addEventListener("canplay", handleCanPlay);
    videoElement.addEventListener("ended", handleEnded);

    return () => {
      videoElement.removeEventListener(
        "loadedmetadata",
        handleLoadedMetadata
      );
      videoElement.removeEventListener("timeupdate", handleTimeUpdate);
      videoElement.removeEventListener("play", handlePlay);
      videoElement.removeEventListener("pause", handlePause);
      videoElement.removeEventListener("waiting", handleWaiting);
      videoElement.removeEventListener("canplay", handleCanPlay);
      videoElement.removeEventListener("ended", handleEnded);
    };
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener(
      "fullscreenchange",
      handleFullscreenChange
    );

    return () => {
      document.removeEventListener(
        "fullscreenchange",
        handleFullscreenChange
      );
    };
  }, []);

  const handleDoubleTap = (
    side: "left" | "right"
  ) => {
    const now = Date.now();

    if (
      lastTap &&
      lastTap.side === side &&
      now - lastTap.time < 350
    ) {
      if (side === "right") {
        seek(10);
      } else {
        seek(-10);
      }

      setLastTap(null);
      return;
    }

    setLastTap({
      time: now,
      side,
    });
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement) return;

      switch (event.key) {
        case " ":
          event.preventDefault();
          togglePlay();
          break;

        case "ArrowRight":
          seek(10);
          break;

        case "ArrowLeft":
          seek(-10);
          break;

        case "ArrowUp":
          event.preventDefault();
          handleVolume(Math.min(1, volume + 0.1));
          break;

        case "ArrowDown":
          event.preventDefault();
          handleVolume(Math.max(0, volume - 0.1));
          break;

        case "f":
        case "F":
          toggleFullscreen();
          break;

        case "m":
        case "M":
          toggleMute();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [volume]);

  return (
    <div
      ref={playerRef}
      className="relative aspect-video overflow-hidden rounded-lg bg-black"
    >
      {/* Video */}
      <video
        ref={videoRef}
        src={videoUrl}
        className="h-full w-full object-contain"
        playsInline
        preload="metadata"
        onClick={togglePlay}
      />

      {/* Loading */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/30 border-t-white" />
        </div>
      )}

      {/* Mobile double tap areas */}
      <div
        className="absolute inset-y-0 left-0 w-1/3 md:hidden"
        onClick={(e) => {
          e.stopPropagation();
          handleDoubleTap("left");
        }}
      />

      <div
        className="absolute inset-y-0 right-0 w-1/3 md:hidden"
        onClick={(e) => {
          e.stopPropagation();
          handleDoubleTap("right");
        }}
      />

      {/* Controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent px-3 pb-3 pt-10">
        {/* Progress */}
        <input
          type="range"
          min="0"
          max={duration || 0}
          step="0.1"
          value={currentTime}
          onChange={(e) => {
            const time = Number(e.target.value);

            if (videoRef.current) {
              videoRef.current.currentTime = time;
            }

            setCurrentTime(time);
          }}
          className="mb-2 w-full cursor-pointer accent-red-600"
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            {/* Play */}
            <button
              onClick={togglePlay}
              className="rounded-full p-2 text-white hover:bg-white/20"
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5" />
              )}
            </button>

            {/* Rewind */}
            <button
              onClick={() => seek(-10)}
              className="rounded-full p-2 text-white hover:bg-white/20"
              title="Rewind 10 seconds"
            >
              <RotateCcw className="h-5 w-5" />
            </button>

            {/* Forward */}
            <button
              onClick={() => seek(10)}
              className="rounded-full p-2 text-white hover:bg-white/20"
              title="Forward 10 seconds"
            >
              <RotateCw className="h-5 w-5" />
            </button>

            {/* Volume */}
            <button
              onClick={toggleMute}
              className="rounded-full p-2 text-white hover:bg-white/20"
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="h-5 w-5" />
              ) : (
                <Volume2 className="h-5 w-5" />
              )}
            </button>

            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={(e) =>
                handleVolume(Number(e.target.value))
              }
              className="hidden w-20 cursor-pointer accent-red-600 sm:block"
            />

            {/* Time */}
            <span className="ml-2 text-xs text-white sm:text-sm">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-1">
            {/* Next video */}
            <button
              onClick={() => {
                console.log("Next video clicked");
              }}
              className="rounded-full p-2 text-white hover:bg-white/20"
              title="Next video"
            >
              <SkipForward className="h-5 w-5" />
            </button>

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="rounded-full p-2 text-white hover:bg-white/20"
              title="Fullscreen"
            >
              {isFullscreen ? (
                <Minimize className="h-5 w-5" />
              ) : (
                <Maximize className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}