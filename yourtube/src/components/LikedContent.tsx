"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { MoreVertical, X, ThumbsUp, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUser } from "@/lib/AuthContext";
import axiosInstance from "@/lib/axiosinstance";

export default function LikedVideosContent() {
  const [likedVideos, setLikedVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();

  useEffect(() => {
    if (user) {
      loadLikedVideos();
    }
  }, [user]);

  const loadLikedVideos = async () => {
    if (!user) return;

    try {
      const likedData = await axiosInstance.get(`/like/${user?._id}`);

      setLikedVideos(likedData.data);
    } catch (error) {
      console.error("Error loading liked videos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnlikeVideo = async (videoId: string, likedVideoId: string) => {
    if (!user) return;

    try {
      await axiosInstance.delete(`/like/${likedVideoId}`);
      setLikedVideos((prev) => prev.filter((item) => item._id !== likedVideoId));
    } catch (error) {
      console.error("Error unliking video:", error);
      alert("Failed to remove video from liked list");
    }
  };

  if (!user) {
    return (
      <div className="text-center py-12">
        <ThumbsUp className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold mb-2">
          Keep track of videos you like
        </h2>
        <p className="text-gray-600">Sign in to see your liked videos.</p>
      </div>
    );
  }

  if (loading) {
    return <div>Loading liked videos...</div>;
  }

  if (likedVideos.length === 0) {
    return (
      <div className="text-center py-12">
        <ThumbsUp className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold mb-2">No liked videos yet</h2>
        <p className="text-gray-600">Videos you like will appear here.</p>
      </div>
    );
  }
  const videos = "/video/vdo.mp4";
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">{likedVideos.length} videos</p>
        <Button className="flex items-center gap-2 bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200">
          <Play className="w-4 h-4" />
          Play all
        </Button>
      </div>

      <div className="space-y-4">
        {likedVideos.map((item) => (
          <div key={item._id} className="flex gap-4 group">
            <Link href={`/watch/${item.videoid._id}`} className="flex-shrink-0">
              <div className="relative w-40 aspect-video bg-gray-100 dark:bg-neutral-800 rounded overflow-hidden">
                <video
                  src={`${process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"}/${item.videoid?.filepath}`}
                  className="object-cover group-hover:scale-105 transition-transform duration-200"
                />
              </div>
            </Link>

            <div className="flex-1 min-w-0">
              <Link href={`/watch/${item.videoid._id}`}>
                <h3 className="font-semibold text-sm line-clamp-2 text-black dark:text-white group-hover:text-blue-600 mb-1">
                  {item.videoid.videotitle}
                </h3>
              </Link>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {item.videoid.videochanel}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {item.videoid.views.toLocaleString()} views •{" "}
                {formatDistanceToNow(new Date(item.videoid.createdAt))} ago
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Liked {formatDistanceToNow(new Date(item.createdAt))} ago
              </p>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="opacity-0 group-hover:opacity-100"
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => handleUnlikeVideo(item.videoid._id, item._id)}
                >
                  <X className="w-4 h-4 mr-2" />
                  Remove from liked videos
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}
      </div>
    </div>
  );
}
