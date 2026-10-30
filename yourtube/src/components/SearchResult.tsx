import React, { useEffect, useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Trash2 } from "lucide-react";
import axiosInstance from "@/lib/axiosinstance";
import { useUser } from "@/lib/AuthContext";

const SearchResult = ({ query }: any) => {
  const [video, setvideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();

  const fetchSearchVideos = async () => {
    if (!query || !query.trim()) {
      setvideos([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await axiosInstance.get("/video/getall");
      const allVideos = res.data || [];
      const q = query.trim().toLowerCase();
      const results = allVideos.filter(
        (vid: any) =>
          (vid.videotitle && vid.videotitle.toLowerCase().includes(q)) ||
          (vid.videochanel && vid.videochanel.toLowerCase().includes(q))
      );
      setvideos(results);
    } catch (error) {
      console.error("Error searching videos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSearchVideos();
  }, [query]);

  const handleDeleteVideo = async (videoId: string) => {
    if (!confirm("Are you sure you want to delete this video?")) return;
    try {
      await axiosInstance.delete(`/video/delete/${videoId}`, {
        data: { userId: user?._id },
      });
      setvideos((prev) => prev.filter((v: any) => v._id !== videoId));
      alert("Video deleted successfully");
    } catch (error: any) {
      console.error("Error deleting video:", error);
      alert(error.response?.data?.message || "Failed to delete video");
    }
  };

  if (!query || !query.trim()) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">
          Enter a search term to find videos and channels.
        </p>
      </div>
    );
  }

  if (loading) {
    return <div className="text-gray-500 py-8 text-center">Searching videos...</div>;
  }

  if (video.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-2">No results found</h2>
        <p className="text-gray-600">
          Try different keywords or check spelling
        </p>
      </div>
    );
  }

  const defaultVid = "/video/vdo.mp4";

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {video.map((vid: any) => {
          const isOwner =
            user &&
            (String(user._id) === String(vid.uploader) ||
              user.name === vid.videochanel ||
              user.channelname === vid.videochanel);

          return (
            <div key={vid._id} className="flex gap-4 group relative">
              <Link href={`/watch/${vid._id}`} className="flex-shrink-0">
                <div className="relative w-72 md:w-80 aspect-video bg-gray-100 dark:bg-neutral-800 rounded-lg overflow-hidden border border-gray-200 dark:border-neutral-800">
                  <video
                    src={
                      vid?.filepath
                        ? `${process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"}/${vid.filepath}`
                        : defaultVid
                    }
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-200"
                  />
                  <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1 rounded">
                    10:24
                  </div>
                </div>
              </Link>

              <div className="flex-1 min-w-0 py-1 pr-8">
                <Link href={`/watch/${vid._id}`}>
                  <h3 className="font-semibold text-lg line-clamp-2 text-black dark:text-white group-hover:text-blue-600 mb-2">
                    {vid.videotitle}
                  </h3>
                </Link>

                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                  <span>{(vid.views || 0).toLocaleString()} views</span>
                  <span>•</span>
                  <span>
                    {vid.createdAt
                      ? formatDistanceToNow(new Date(vid.createdAt)) + " ago"
                      : "recently"}
                  </span>
                </div>

                <Link
                  href={`/channel/${vid.uploader || ""}`}
                  className="flex items-center gap-2 mb-2 hover:text-blue-600"
                >
                  <Avatar className="w-6 h-6">
                    <AvatarFallback className="text-xs bg-neutral-800 text-white">
                      {vid.videochanel?.[0] || "Y"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {vid.videochanel}
                  </span>
                </Link>

                <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                  {vid.videotitle} - Watch now on myTube.
                </p>
              </div>

              {isOwner && (
                <button
                  type="button"
                  title="Delete video"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleDeleteVideo(vid._id);
                  }}
                  className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full shadow-lg opacity-80 group-hover:opacity-100 transition-opacity z-10 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div className="text-center py-6 border-t border-gray-200 dark:border-neutral-800">
        <p className="text-gray-500 text-sm">
          Showing {video.length} {video.length === 1 ? "result" : "results"} for "{query}"
        </p>
      </div>
    </div>
  );
};

export default SearchResult;
