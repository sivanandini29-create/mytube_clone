import React, { useEffect, useState } from "react";
import Videocard from "./videocard";
import axiosInstance from "@/lib/axiosinstance";
import { useUser } from "@/lib/AuthContext";

const Videogrid = () => {
  const [videos, setvideo] = useState<any[]>([]);
  const [loading, setloading] = useState(true);
  const { user } = useUser();

  const fetchvideo = async () => {
    try {
      const res = await axiosInstance.get("/video/getall");
      setvideo(res.data || []);
    } catch (error) {
      console.error("Error loading videos:", error);
    } finally {
      setloading(false);
    }
  };

  useEffect(() => {
    fetchvideo();
  }, []);

  const handleDeleteVideo = async (videoId: string) => {
    if (!confirm("Are you sure you want to delete this video?")) return;
    try {
      await axiosInstance.delete(`/video/delete/${videoId}`, {
        data: { userId: user?._id },
      });
      setvideo((prev) => prev.filter((v: any) => v._id !== videoId));
      alert("Video deleted successfully");
    } catch (error: any) {
      console.error("Error deleting video:", error);
      alert(error.response?.data?.message || "Failed to delete video");
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {loading ? (
        <div className="col-span-full py-8 text-center text-gray-500">Loading videos...</div>
      ) : (
        videos.map((video: any) => (
          <Videocard
            key={video._id}
            video={video}
            onDelete={handleDeleteVideo}
          />
        ))
      )}
    </div>
  );
};

export default Videogrid;
