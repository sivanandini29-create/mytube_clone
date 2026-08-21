import comment from "../Modals/comment.js";
import mongoose from "mongoose";

const badWords = ["fuck", "shit", "bitch", "asshole", "dick", "pussy"];

export const postcomment = async (req, res) => {
  const commentdata = req.body;
  const commentText = commentdata.commentbody.toLowerCase();
  const hasBadWord = badWords.some((word) => commentText.includes(word));

  if (hasBadWord) {
    return res.status(400).json({
      message: "comment contain inapprpriate language",
    });
  }

  const existingComment = await comment.findOne({
    userid: commentdata.userid,
    videoid: commentdata.videoid,
    commentbody: commentdata.commentbody,
  });

  if (existingComment) {
    return res.status(400).json({
      message: "Duplicate comment are not allowed.",
    });
  }

  const specialCharPattern = /^([!@#$%^&*()_+=\-{}[\]:;"'<>,.?/\\|`~])\1{4,}$/;

  if (specialCharPattern.test(commentText)) {
    return res.status(400).json({
      message: "special character spam is not allowed",
    });
  }

  const postcomment = new comment(commentdata);
  try {
    await postcomment.save();
    return res.status(200).json({ comment: true });
  } catch (error) {
    console.error(" error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};
export const getallcomment = async (req, res) => {
  const { videoid } = req.params;
  try {
    const commentvideo = await comment.find({ videoid: videoid });
    return res.status(200).json(commentvideo);
  } catch (error) {
    console.error(" error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};
export const deletecomment = async (req, res) => {
  const { id: _id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(404).send("comment unavailable");
  }
  try {
    await comment.findByIdAndDelete(_id);
    return res.status(200).json({ comment: true });
  } catch (error) {
    console.error(" error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const editcomment = async (req, res) => {
  const { id: _id } = req.params;
  const { commentbody } = req.body;
  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(404).send("comment unavailable");
  }
  try {
    const updatecomment = await comment.findByIdAndUpdate(_id, {
      $set: { commentbody: commentbody },
    });
    res.status(200).json(updatecomment);
  } catch (error) {
    console.error(" error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const likeComment = async (req, res) => {
  const { commentId } = req.params;
  const { userId } = req.body;

  const existingComment = await comment.findById(commentId);

  if (!existingComment) {
    return res.status(404).json({
      message: "comment is not found",
    });
  }
  const alreadyLiked = existingComment.likes.includes(userId);
  if (alreadyLiked) {
    existingComment.likes = existingComment.likes.filter(
      (id) => id.toString() !== userId,
    );
  } else {
    existingComment.likes.push(userId);

    existingComment.dislikes = existingComment.dislikes.filter(
      (id) => id.toString() !== userId,
    );
  }

  await existingComment.save();

  return res.status(200).json({
    message: alreadyLiked
      ? "comment unliked successfully"
      : "comment liked successfully",
    likes: existingComment.likes.length,
  });
};

export const dislikeComment = async (req, res) => {
  const { commentId } = req.params;
  const { userId } = req.body;

  const existingComment = await comment.findById(commentId);

  if (!existingComment) {
    return res.status(404).json({
      message: "Comment not found.",
    });
  }

  const alreadyDisliked = existingComment.dislikes.includes(userId);

  if (alreadyDisliked) {
    existingComment.dislikes = existingComment.dislikes.filter(
      (id) => id.toString() !== userId,
    );
  } else {
    existingComment.dislikes.push(userId);

    existingComment.likes = existingComment.likes.filter(
      (id) => id.toString() !== userId,
    );
  }

  await existingComment.save();

  return res.status(200).json({
    message: alreadyDisliked
      ? "Comment undisliked successfully."
      : "Comment disliked successfully.",
    dislikes: existingComment.dislikes.length,
  });
};

export const reportComment = async (req, res) => {
  const { commentId } = req.params;
  const { userId, reason } = req.body;

  try {
    const existingComment = await comment.findById(commentId);

    if (!existingComment) {
      return res.status(404).json({
        message: "comment not found",
      });
    }

    const alreadyReported = existingComment.reportscomments.some(
      (report) => report.userrId.toString() === userId,
    );
    if (alreadyReported) {
      return res.status(400).json({
        message: "you have already reported this comment",
      });
    }

    existingComment.reports.push({
      userrId: userId,
      reason: reason || "inappropirate content",
    });
    existingComment.isflagged = true;
    await existingComment.save();
    return res.status(200).json({
      message: "comment reported successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "something went wrong",
    });
  }
};
