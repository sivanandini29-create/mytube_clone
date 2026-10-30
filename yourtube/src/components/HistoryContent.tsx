"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { MoreVertical, X, Clock, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import axiosInstance from "@/lib/axiosinstance";
import { useUser } from "@/lib/AuthContext";

export default function HistoryContent() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();

  useEffect(() => {
    if (user) {
      loadHistory();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadHistory = async () => {
    if (!user) return;

    try {
      const historyData = await axiosInstance.get(`/history/${user?._id}`);
      setHistory(historyData.data || []);
    } catch (error) {
      console.error("Error loading history:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromHistory = async (historyId: string) => {
    try {
      await axiosInstance.delete(`/history/${historyId}`);
      setHistory((prev) => prev.filter((item) => item._id !== historyId));
    } catch (error) {
      console.error("Error removing from history:", error);
      alert("Failed to remove video from history");
    }
  };

  const handleClearAllHistory = async () => {
    if (!user) return;
    if (!confirm("Are you sure you want to clear your entire watch history?")) return;

    try {
      await axiosInstance.delete(`/history/clear/${user._id}`);
      setHistory([]);
    } catch (error) {
      console.error("Error clearing history:", error);
      alert("Failed to clear watch history");
    }
  };

  if (!user) {
    return (
      <div className="text-center py-12">
        <Clock className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold mb-2">
          Keep track of what you watch
        </h2>
        <p className="text-gray-600">
          Watch history isn't viewable when signed out.
        </p>
      </div>
    );
  }

  if (loading) {
    return <div className="text-gray-500 py-4">Loading history...</div>;
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-12">
        <Clock className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold mb-2">No watch history yet</h2>
        <p className="text-gray-600">Videos you watch will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center pb-2 border-b border-gray-200 dark:border-neutral-800">
        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
          {history.length} {history.length === 1 ? "video" : "videos"}
        </p>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClearAllHistory}
          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-1.5 cursor-pointer text-xs"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Clear all watch history
        </Button>
      </div>

      <div className="space-y-4">
        {history.map((item) => {
          if (!item.videoid) return null;
          return (
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
                  {(item.videoid.views || 0).toLocaleString()} views •{" "}
                  {item.videoid.createdAt
                    ? formatDistanceToNow(new Date(item.videoid.createdAt)) + " ago"
                    : "recently"}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Watched {item.createdAt ? formatDistanceToNow(new Date(item.createdAt)) + " ago" : "recently"}
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
                    onClick={() => handleRemoveFromHistory(item._id)}
                    className="text-red-600 cursor-pointer flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Remove from watch history
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        })}
      </div>
    </div>
  );
}
