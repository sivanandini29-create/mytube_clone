import React from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Trash2 } from "lucide-react";
import { useUser } from "@/lib/AuthContext";

export default function VideoCard({ video, canDelete, onDelete }: any) {
  const { user } = useUser();
  const allowDelete =
    canDelete ||
    (user &&
      (String(user._id) === String(video?.uploader) ||
        user.name === video?.videochanel ||
        user.channelname === video?.videochanel));

  return (
    <div className="group relative">
      <Link href={`/watch/${video?._id}`} className="block">
        <div className="space-y-3">
          <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
            <video
              src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/${video?.filepath}`}
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-200"
            />
            <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1 rounded">
              10:24
            </div>
          </div>
          <div className="flex gap-3">
            <Avatar className="w-9 h-9 flex-shrink-0 bg-gray-200 dark:bg-gray-700">
              <AvatarFallback className="text-black dark:text-white">
                {video?.videochanel?.[0] || "Y"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0 pr-6">
              <h3 className="font-medium text-sm line-clamp-2 text-black dark:text-white group-hover:text-blue-600">
                {video?.videotitle}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {video?.videochanel}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {(video?.views || 0).toLocaleString()} views •{" "}
                {video?.createdAt
                  ? formatDistanceToNow(new Date(video?.createdAt)) + " ago"
                  : "recently"}
              </p>
            </div>
          </div>
        </div>
      </Link>

      {allowDelete && onDelete && (
        <button
          type="button"
          title="Delete video"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDelete(video._id);
          }}
          className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-1.5 rounded-full shadow-lg opacity-80 group-hover:opacity-100 transition-opacity z-10"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
