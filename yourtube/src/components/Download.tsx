import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axiosinstance";

const Downloads = ({ user }: any) => {
  const [downloads, setDownloads] = useState<any[]>([]);

  useEffect(() => {
    if (user?._id) {
      fetchDownloads();
    }
  }, [user]);

  const fetchDownloads = async () => {
    try {
      const res = await axiosInstance.get(`/download/${user._id}`);
      setDownloads(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="p-6 max-w-4xl space-y-6 text-black dark:text-white">
      <h2 className="text-2xl font-bold">My Downloads</h2>

      {downloads.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">No Downloads Found</p>
      ) : (
        <div className="space-y-4">
          {downloads.map((item: any) => (
            <div
              key={item._id}
              className="p-4 rounded-xl border border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-900/50"
            >
              <h3 className="font-semibold text-base mb-1">
                {item.videoid?.videotitle || "Untitled Video"}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Plan: <span className="font-medium">{item.userplan}</span>
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                Downloaded: {new Date(item.downloadedat).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Downloads;
