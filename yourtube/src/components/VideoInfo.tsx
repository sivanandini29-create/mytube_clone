import React, { useEffect, useState } from "react";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Button } from "./ui/button";
import {
  Clock,
  Download,
  MoreHorizontal,
  Share,
  ThumbsDown,
  ThumbsUp,
  Trash2,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useUser } from "@/lib/AuthContext";
import axiosInstance from "@/lib/axiosinstance";
import { useRouter } from "next/router";

const VideoInfo = ({ video }: any) => {
  const router = useRouter();
  const [likes, setlikes] = useState(video.Like || 0);
  const [dislikes, setDislikes] = useState(video.Dislike || 0);
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const { user } = useUser();
  const [isWatchLater, setIsWatchLater] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isUploader = user && (
    String(user._id) === String(video.uploader) ||
    user.name === video.videochanel ||
    user.channelname === video.videochanel
  );

  // const user: any = {
  //   id: "1",
  //   name: "John Doe",
  //   email: "john@example.com",
  //   image: "https://github.com/shadcn.png?height=32&width=32",
  // };
  useEffect(() => {
    setlikes(video.Like || 0);
    setDislikes(video.Dislike || 0);
    setIsLiked(false);
    setIsDisliked(false);
  }, [video]);

  useEffect(() => {
    const handleviews = async () => {
      try {
        if (user) {
          return await axiosInstance.post(`/history/${video._id}`, {
            userId: user?._id,
          });
        } else {
          return await axiosInstance.post(`/history/views/${video?._id}`);
        }
      } catch (error) {
        console.log(error);
      }
    };
  }, [user]);
  const handleLike = async () => {
    if (!user) return;
    try {
      const res = await axiosInstance.post(`/like/${video._id}`, {
        userId: user?._id,
      });
      if (res.data.liked) {
        if (isLiked) {
          setlikes((prev: any) => prev - 1);
          setIsLiked(false);
        } else {
          setlikes((prev: any) => prev + 1);
          setIsLiked(true);
          if (isDisliked) {
            setDislikes((prev: any) => prev - 1);
            setIsDisliked(false);
          }
        }
      }
    } catch (error) {
      console.log(error);
    }
  };
  const handleWatchLater = async () => {
    try {
      const res = await axiosInstance.post(`/watch/${video._id}`, {
        userId: user?._id,
      });
      if (res.data.watchlater) {
        setIsWatchLater(!isWatchLater);
      } else {
        setIsWatchLater(false);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const handleDislike = async () => {
    if (!user) return;
    try {
      const res = await axiosInstance.post(`/like/${video._id}`, {
        userId: user?._id,
      });
      if (!res.data.liked) {
        if (isDisliked) {
          setDislikes((prev: any) => prev - 1);
          setIsDisliked(false);
        } else {
          setDislikes((prev: any) => prev + 1);
          setIsDisliked(true);
          if (isLiked) {
            setlikes((prev: any) => prev - 1);
            setIsLiked(false);
          }
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleDownload = async () => {
    if (!user) return;

    try {
      console.log(user._id);
      console.log(user._id.length);
      const res = await axiosInstance.post(`/download/${video._id}`, {
        userId: user._id,
      });

      alert(res.data.message);
    } catch (error: any) {
      alert(error.response?.data?.message || "something went wrong");
    }
  };

  const handleDeleteVideo = async () => {
    if (!confirm("Are you sure you want to delete this video? This action cannot be undone.")) {
      return;
    }
    try {
      setIsDeleting(true);
      await axiosInstance.delete(`/video/delete/${video._id}`, {
        data: { userId: user?._id },
      });
      alert("Video deleted successfully");
      router.push("/");
    } catch (error: any) {
      console.error("Delete video error:", error);
      alert(error.response?.data?.message || "Failed to delete video");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-black dark:text-white">
        {video.videotitle}
      </h1>

      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Avatar className="w-10 h-10 border border-gray-200 dark:border-neutral-800">
            <AvatarFallback className="bg-neutral-800 text-white font-medium">
              {video.videochanel?.[0] || "Y"}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-black dark:text-white">
              {video.videochanel}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              1.2M subscribers
            </p>
          </div>
          <Button className="ml-4 bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 rounded-full font-medium px-4">
            Subscribe
          </Button>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center bg-gray-100 dark:bg-neutral-800 rounded-full text-black dark:text-white border border-gray-200 dark:border-neutral-700">
            <Button
              variant="ghost"
              size="sm"
              className="rounded-l-full text-black dark:text-white hover:bg-gray-200 dark:hover:bg-neutral-700 px-3 cursor-pointer"
              onClick={handleLike}
            >
              <ThumbsUp
                className={`w-4 h-4 mr-1.5 ${
                  isLiked
                    ? "fill-black dark:fill-white text-black dark:text-white"
                    : "text-black dark:text-white"
                }`}
              />
              <span className="font-medium text-sm text-black dark:text-white">
                {likes.toLocaleString()}
              </span>
            </Button>
            <div className="w-px h-5 bg-gray-300 dark:bg-neutral-600" />
            <Button
              variant="ghost"
              size="sm"
              className="rounded-r-full text-black dark:text-white hover:bg-gray-200 dark:hover:bg-neutral-700 px-3 cursor-pointer"
              onClick={handleDislike}
            >
              <ThumbsDown
                className={`w-4 h-4 mr-1.5 ${
                  isDisliked
                    ? "fill-black dark:fill-white text-black dark:text-white"
                    : "text-black dark:text-white"
                }`}
              />
              <span className="font-medium text-sm text-black dark:text-white">
                {dislikes.toLocaleString()}
              </span>
            </Button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className={`bg-gray-100 dark:bg-neutral-800 text-black dark:text-white hover:bg-gray-200 dark:hover:bg-neutral-700 rounded-full border border-gray-200 dark:border-neutral-700 cursor-pointer ${
              isWatchLater ? "!text-blue-600 dark:!text-blue-400 font-medium" : ""
            }`}
            onClick={handleWatchLater}
          >
            <Clock className="w-4 h-4 mr-1.5" />
            <span className="text-sm font-medium">{isWatchLater ? "Saved" : "Watch Later"}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="bg-gray-100 dark:bg-neutral-800 text-black dark:text-white hover:bg-gray-200 dark:hover:bg-neutral-700 rounded-full border border-gray-200 dark:border-neutral-700 cursor-pointer"
          >
            <Share className="w-4 h-4 mr-1.5" />
            <span className="text-sm font-medium">Share</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="bg-gray-100 dark:bg-neutral-800 text-black dark:text-white hover:bg-gray-200 dark:hover:bg-neutral-700 rounded-full border border-gray-200 dark:border-neutral-700 cursor-pointer"
            onClick={handleDownload}
          >
            <Download className="w-4 h-4 mr-1.5" />
            <span className="text-sm font-medium">Download</span>
          </Button>

          {isUploader && (
            <Button
              variant="destructive"
              size="sm"
              className="rounded-full bg-red-600 hover:bg-red-700 text-white font-medium cursor-pointer"
              onClick={handleDeleteVideo}
              disabled={isDeleting}
            >
              <Trash2 className="w-4 h-4 mr-1.5" />
              {isDeleting ? "Deleting..." : "Delete Video"}
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="bg-gray-100 dark:bg-neutral-800 text-black dark:text-white hover:bg-gray-200 dark:hover:bg-neutral-700 rounded-full border border-gray-200 dark:border-neutral-700 cursor-pointer"
          >
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="bg-gray-100 dark:bg-neutral-900 rounded-xl p-4 text-black dark:text-white border border-gray-200 dark:border-neutral-800">
        <div className="flex gap-4 text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
          <span>{video.views.toLocaleString()} views</span>
          <span>{formatDistanceToNow(new Date(video.createdAt))} ago</span>
        </div>
        <div className={`text-sm text-gray-700 dark:text-gray-300 ${showFullDescription ? "" : "line-clamp-3"}`}>
          <p>
            Sample video description. This would contain the actual video
            description from the database.
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="mt-2 p-0 h-auto font-semibold text-gray-900 dark:text-gray-100 hover:bg-transparent cursor-pointer"
          onClick={() => setShowFullDescription(!showFullDescription)}
        >
          {showFullDescription ? "Show less" : "Show more"}
        </Button>
      </div>
    </div>
  );
};

export default VideoInfo;
