import Download from "../Modals/download.js";
import User from "../Modals/Auth.js";

export const downloadVideo = async (req, res) => {
  const { videoId } = req.params;
  const { userId } = req.body;

  console.log("DOWNLOAD REQUEST");
  console.log("videoId:", videoId);
  console.log("userId:", userId);

  try {
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    if (!videoId) {
      return res.status(400).json({
        success: false,
        message: "Video ID is required",
      });
    }

    const existingUser = await User.findById(userId);

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "User is not found",
      });
    }

    console.log("Found user:", existingUser.email);
    console.log("User plan:", existingUser.plan);

    if (existingUser.plan === "free") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todayDownloads = await Download.countDocuments({
        userid: userId,
        downloadedat: { $gte: today },
      });

      console.log("Today's downloads:", todayDownloads);

      if (todayDownloads >= 1) {
        return res.status(403).json({
          success: false,
          message: "Free plan users can only download 1 video per day",
        });
      }
    }

    const newDownload = new Download({
      userid: userId,
      videoid: videoId,
      userplan: existingUser.plan,
    });

    await newDownload.save();

    console.log("Download saved successfully");

    return res.status(200).json({
      success: true,
      message: "Video downloaded successfully",
    });
  } catch (error) {
    console.error("DOWNLOAD ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

export const getDownloads = async (req, res) => {
  const { userId } = req.params;

  console.log("GET DOWNLOADS");
  console.log("userId:", userId);

  try {
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const downloads = await Download.find({
      userid: userId,
    })
      .populate("videoid")
      .sort({ downloadedat: -1 });

    return res.status(200).json(downloads);
  } catch (error) {
    console.error("GET DOWNLOADS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};