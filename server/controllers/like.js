import video from "../Modals/video.js";
import like from "../Modals/like.js";

export const handlelike = async (req, res) => {
  const { userId } = req.body;
  const { videoId } = req.params;
  try {
    const exisitinglike = await like.findOne({
      viewer: userId,
      videoid: videoId,
    });
    if (exisitinglike) {
      await like.findByIdAndDelete(exisitinglike._id);
      await video.findByIdAndUpdate(videoId, { $inc: { Like: -1 } });
      return res.status(200).json({ liked: false });
    } else {
      await like.create({ viewer: userId, videoid: videoId });
      await video.findByIdAndUpdate(videoId, { $inc: { Like: 1 } });
      return res.status(200).json({ liked: true });
    }
  } catch (error) {
    console.error(" error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const getallLikedVideo = async (req, res) => {
  const { userId } = req.params;
  try {
    const likevideo = await like
      .find({ viewer: userId })
      .populate({
        path: "videoid",
        model: "videofiles",
      })
      .exec();
    return res.status(200).json(likevideo);
  } catch (error) {
    console.error(" error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const deletelike = async (req, res) => {
  const { id } = req.params;
  try {
    const likeDoc = await like.findById(id);
    if (likeDoc) {
      if (likeDoc.videoid) {
        await video.findByIdAndUpdate(likeDoc.videoid, { $inc: { Like: -1 } });
      }
      await like.findByIdAndDelete(id);
    }
    return res.status(200).json({ message: "Removed from liked videos", success: true });
  } catch (error) {
    console.error("deletelike error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};
