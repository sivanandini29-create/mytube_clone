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
    <div>
      <h2>My Downloads</h2>

      {downloads.length === 0 ? (
        <p>No Downloads Found</p>
      ) : (
        downloads.map((item: any) => (
          <div key={item._id}>
            <h3>{item.videoid?.videotitle}</h3>
            <p>Plan: {item.userplan}</p>
            <p>
              Downloaded: {new Date(item.downloadedat).toLocaleDateString()}
            </p>
          </div>
        ))
      )}
    </div>
  );
};

export default Downloads;
