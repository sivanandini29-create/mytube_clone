import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import video from "../Modals/video.js";

export const uploadvideo = async (req, res) => {
  if (req.file === undefined) {
    return res
      .status(404)
      .json({ message: "plz upload a mp4 video file only" });
  } else {
    try {
      const file = new video({
        videotitle: req.body.videotitle,
        filename: req.file.originalname,
        filepath: req.file.path.replace(/\\/g, "/"),
        filetype: req.file.mimetype,
        filesize: req.file.size,
        videochanel: req.body.videochanel,
        uploader: req.body.uploader,
      });
      await file.save();
      return res.status(201).json("file uploaded successfully");
    } catch (error) {
      console.error(" error:", error);
      return res.status(500).json({ message: "Something went wrong" });
    }
  }
};

export const getallvideo = async (req, res) => {
  try {
    const files = await video.find();
    return res.status(200).send(files);
  } catch (error) {
    console.error(" error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const deletevideo = async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid video ID" });
    }

    const videoToDelete = await video.findById(id);
    if (!videoToDelete) {
      return res.status(404).json({ message: "Video not found" });
    }

    // If userId provided and video has an uploader, verify ownership
    if (userId && videoToDelete.uploader && String(videoToDelete.uploader) !== String(userId)) {
      return res.status(403).json({ message: "You are not authorized to delete this video" });
    }

    // Try deleting file from disk
    if (videoToDelete.filepath) {
      try {
        const fullDiskPath = path.resolve(videoToDelete.filepath);
        if (fs.existsSync(fullDiskPath)) {
          fs.unlinkSync(fullDiskPath);
          console.log(`[VIDEO] File deleted from disk: ${fullDiskPath}`);
        }
      } catch (fileErr) {
        console.warn(`[VIDEO] Could not delete file from disk: ${fileErr.message}`);
      }
    }

    await video.findByIdAndDelete(id);

    return res.status(200).json({
      message: "Video deleted successfully",
      videoId: id,
    });
  } catch (error) {
    console.error("Delete video error:", error);
    return res.status(500).json({ message: "Failed to delete video" });
  }
};
