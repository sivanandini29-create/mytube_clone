import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import ChannelHeader from "@/components/ChannelHeader";
import Channeltabs from "@/components/Channeltabs";
import ChannelVideos from "@/components/ChannelVideos";
import VideoUploader from "@/components/VideoUploader";
import { useUser } from "@/lib/AuthContext";
import axiosInstance from "@/lib/axiosinstance";

const ChannelPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useUser();
  const [channelVideos, setChannelVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const channel = user;

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/video/getall");
      if (Array.isArray(res.data)) {
        const filtered = res.data.filter(
          (vid: any) =>
            String(vid.uploader) === String(id) ||
            vid.videochanel === channel?.channelname ||
            vid.videochanel === channel?.name
        );
        setChannelVideos(filtered);
      }
    } catch (error) {
      console.error("Error fetching channel videos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchVideos();
    }
  }, [id, channel?.channelname]);

  const handleDeleteVideo = async (videoId: string) => {
    if (!confirm("Are you sure you want to delete this video?")) {
      return;
    }
    try {
      await axiosInstance.delete(`/video/delete/${videoId}`, {
        data: { userId: user?._id },
      });
      setChannelVideos((prev) => prev.filter((v: any) => v._id !== videoId));
      alert("Video deleted successfully");
    } catch (error: any) {
      console.error("Error deleting video:", error);
      alert(error.response?.data?.message || "Failed to delete video");
    }
  };

  const isOwner = Boolean(
    user && (String(user._id) === String(id) || user.name === channel?.name)
  );

  return (
    <div className="flex-1 min-h-screen bg-white dark:bg-neutral-950 text-black dark:text-white">
      <div className="max-w-full mx-auto">
        <ChannelHeader channel={channel} user={user} />
        <Channeltabs />
        {isOwner && (
          <div className="px-4 pb-8">
            <VideoUploader channelId={id} channelName={channel?.channelname || channel?.name} />
          </div>
        )}
        <div className="px-4 pb-8">
          {loading ? (
            <p className="text-gray-500 py-8 text-center">Loading videos...</p>
          ) : (
            <ChannelVideos
              videos={channelVideos}
              canDelete={isOwner}
              onDelete={handleDeleteVideo}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ChannelPage;
