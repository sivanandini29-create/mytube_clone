import React, { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, Trash2, CornerDownRight, ChevronDown, ChevronUp } from "lucide-react";
import { useUser } from "@/lib/AuthContext";
import axiosInstance from "@/lib/axiosinstance";

interface Reply {
  _id: string;
  userid: string;
  usercommented: string;
  commentbody: string;
  commentedon: string;
  likes?: string[];
  dislikes?: string[];
}

interface Comment {
  _id: string;
  videoid: string;
  userid: string;
  commentbody: string;
  usercommented: string;
  commentedon: string;
  likes: string[];
  dislikes: string[];
  replies?: Reply[];
}

const Comments = ({ videoId }: any) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [replyingCommentId, setReplyingCommentId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [expandedReplies, setExpandedReplies] = useState<{ [commentId: string]: boolean }>({});
  const { user } = useUser();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadComments();
  }, [videoId]);

  const loadComments = async () => {
    try {
      const res = await axiosInstance.get(`/comment/${videoId}`);
      setComments(res.data || []);
    } catch (error) {
      console.error("Error loading comments:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleReplies = (commentId: string) => {
    setExpandedReplies((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  const handleSubmitComment = async () => {
    if (!user || !newComment.trim()) return;

    setIsSubmitting(true);
    setErrorMessage("");
    try {
      const res = await axiosInstance.post(`/comment/postcomment`, {
        videoid: videoId,
        userid: user._id,
        commentbody: newComment.trim(),
        usercommented: user.name || "Anonymous",
      });
      if (res.data) {
        setNewComment("");
        await loadComments();
      }
    } catch (error: any) {
      if (error.response?.data?.message) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage("Something went wrong");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (comment: Comment) => {
    setEditingCommentId(comment._id);
    setEditText(comment.commentbody);
  };

  const handleUpdateComment = async () => {
    if (!editText.trim()) return;
    try {
      const res = await axiosInstance.post(
        `/comment/editcomment/${editingCommentId}`,
        { commentbody: editText },
      );
      if (res.data) {
        setComments((prev) =>
          prev.map((c) =>
            c._id === editingCommentId ? { ...c, commentbody: editText } : c,
          ),
        );
        setEditingCommentId(null);
        setEditText("");
      }
    } catch (error) {
      console.error("Error updating comment:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;
    try {
      const res = await axiosInstance.delete(`/comment/deletecomment/${id}`);
      if (res.data) {
        setComments((prev) => prev.filter((c) => c._id !== id));
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  const handlePostReply = async (commentId: string) => {
    if (!user || !replyText.trim()) return;
    setIsSubmittingReply(true);
    try {
      const res = await axiosInstance.post(`/comment/reply/${commentId}`, {
        userid: user._id,
        usercommented: user.name || "Anonymous",
        commentbody: replyText.trim(),
      });
      if (res.data && res.data.success) {
        setComments((prev) =>
          prev.map((c) => {
            if (c._id === commentId) {
              const currentReplies = c.replies || [];
              return {
                ...c,
                replies: [...currentReplies, res.data.reply],
              };
            }
            return c;
          }),
        );
        setReplyText("");
        setReplyingCommentId(null);
        setExpandedReplies((prev) => ({ ...prev, [commentId]: true }));
      }
    } catch (error: any) {
      console.error("Error posting reply:", error);
      alert(error.response?.data?.message || "Failed to post reply");
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const handleDeleteReply = async (commentId: string, replyId: string) => {
    if (!confirm("Are you sure you want to delete this reply?")) return;
    try {
      await axiosInstance.delete(`/comment/delete/${commentId}/reply/${replyId}`, {
        data: { userId: user?._id },
      });
      setComments((prev) =>
        prev.map((c) => {
          if (c._id === commentId && c.replies) {
            return {
              ...c,
              replies: c.replies.filter((r) => r._id !== replyId),
            };
          }
          return c;
        }),
      );
    } catch (error: any) {
      console.error("Error deleting reply:", error);
      alert(error.response?.data?.message || "Failed to delete reply");
    }
  };

  const handleLike = async (commentId: string) => {
    if (!user) return;
    try {
      const res = await axiosInstance.post(`/comment/like/${commentId}`, {
        userId: user._id,
      });
      if (res.status === 200) {
        loadComments();
      }
    } catch (error) {
      console.error("Error liking comment:", error);
    }
  };

  const handleDislike = async (commentId: string) => {
    if (!user) return;
    try {
      const res = await axiosInstance.post(`/comment/dislike/${commentId}`, {
        userId: user._id,
      });
      if (res.status === 200) {
        loadComments();
      }
    } catch (error) {
      console.error("Error disliking comment:", error);
    }
  };

  const handleReport = async (commentId: string) => {
    if (!user) return;
    try {
      const res = await axiosInstance.post(`/comment/report/${commentId}`, {
        userId: user._id,
        reason: "Inappropriate content",
      });
      alert(res.data.message);
      loadComments();
    } catch (error: any) {
      alert(error.response?.data?.message || "Something went wrong");
    }
  };

  if (loading) {
    return <div className="text-gray-500 py-4">Loading comments...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-black dark:text-white">
        {comments.length} Comments
      </h2>

      {user && (
        <div className="flex gap-4">
          <Avatar className="w-10 h-10 border border-gray-200 dark:border-neutral-800">
            <AvatarImage src={user.image || ""} />
            <AvatarFallback className="bg-neutral-800 text-white font-medium">
              {user.name?.[0] || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            <Textarea
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e: any) => setNewComment(e.target.value)}
              className="min-h-[80px] resize-none border-0 border-b-2 border-gray-300 dark:border-neutral-700 rounded-none focus-visible:ring-0 bg-transparent text-black dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-black dark:focus:border-white"
            />

            {errorMessage && (
              <p className="text-red-500 text-sm">{errorMessage}</p>
            )}

            <div className="flex gap-2 justify-end">
              <Button
                variant="ghost"
                onClick={() => setNewComment("")}
                disabled={!newComment.trim()}
                className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800 cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitComment}
                disabled={!newComment.trim() || isSubmitting}
                className="bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 rounded-full font-medium cursor-pointer"
              >
                Comment
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {comments.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 italic">
            No comments yet. Be the first to comment!
          </p>
        ) : (
          comments.map((comment) => {
            const hasReplies = comment.replies && comment.replies.length > 0;
            const isReplying = replyingCommentId === comment._id;
            const areRepliesExpanded = expandedReplies[comment._id] || false;

            return (
              <div key={comment._id} className="space-y-2">
                <div className="flex gap-4">
                  <Avatar className="w-10 h-10 border border-gray-200 dark:border-neutral-800 flex-shrink-0">
                    <AvatarFallback className="bg-neutral-800 text-white font-medium">
                      {comment.usercommented?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm text-black dark:text-white">
                        {comment.usercommented}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {comment.commentedon
                          ? formatDistanceToNow(new Date(comment.commentedon)) + " ago"
                          : "recently"}
                      </span>
                    </div>

                    {editingCommentId === comment._id ? (
                      <div className="space-y-2">
                        <Textarea
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className="text-black dark:text-white bg-transparent border-gray-300 dark:border-neutral-700"
                        />
                        <div className="flex gap-2 justify-end">
                          <Button
                            onClick={handleUpdateComment}
                            disabled={!editText.trim()}
                            className="bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 rounded-full font-medium cursor-pointer"
                          >
                            Save
                          </Button>
                          <Button
                            variant="ghost"
                            onClick={() => {
                              setEditingCommentId(null);
                              setEditText("");
                            }}
                            className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800 cursor-pointer"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm text-gray-800 dark:text-gray-200 mt-1">
                          {comment.commentbody}
                        </p>

                        <div className="flex items-center gap-4 mt-2 text-sm">
                          <button
                            onClick={() => handleLike(comment._id)}
                            className="text-blue-600 dark:text-blue-400 hover:underline font-medium cursor-pointer"
                          >
                            Like ({comment.likes?.length || 0})
                          </button>
                          <button
                            onClick={() => handleDislike(comment._id)}
                            className="text-red-600 dark:text-red-400 hover:underline font-medium cursor-pointer"
                          >
                            Dislike ({comment.dislikes?.length || 0})
                          </button>
                          {user && (
                            <button
                              onClick={() => {
                                setReplyingCommentId(
                                  isReplying ? null : comment._id
                                );
                                setReplyText("");
                              }}
                              className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white font-medium cursor-pointer flex items-center gap-1"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              Reply
                            </button>
                          )}
                        </div>

                        <div className="flex items-center gap-3 mt-2 text-sm text-gray-600 dark:text-gray-400">
                          {comment.userid === user?._id && (
                            <>
                              <button
                                onClick={() => handleEdit(comment)}
                                className="hover:text-black dark:hover:text-white cursor-pointer"
                              >
                                Edit
                              </button>

                              <button
                                onClick={() => handleDelete(comment._id)}
                                className="hover:text-red-600 dark:hover:text-red-400 cursor-pointer flex items-center gap-1 text-red-500"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                Delete
                              </button>
                            </>
                          )}

                          {comment.userid !== user?._id && user && (
                            <button
                              onClick={() => handleReport(comment._id)}
                              className="text-red-600 dark:text-red-400 hover:underline cursor-pointer"
                            >
                              Report
                            </button>
                          )}
                        </div>
                      </>
                    )}

                    {/* Inline reply input */}
                    {isReplying && (
                      <div className="mt-3 pl-4 border-l-2 border-gray-300 dark:border-neutral-700 space-y-2">
                        <Textarea
                          placeholder={`Reply to ${comment.usercommented}...`}
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          className="min-h-[60px] resize-none bg-transparent text-sm text-black dark:text-white border-gray-300 dark:border-neutral-700"
                        />
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setReplyingCommentId(null);
                              setReplyText("");
                            }}
                            className="cursor-pointer"
                          >
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handlePostReply(comment._id)}
                            disabled={!replyText.trim() || isSubmittingReply}
                            className="bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black rounded-full cursor-pointer"
                          >
                            {isSubmittingReply ? "Replying..." : "Reply"}
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Nested Replies Toggle & Render */}
                    {hasReplies && (
                      <div className="mt-2">
                        <button
                          onClick={() => toggleReplies(comment._id)}
                          className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer py-1"
                        >
                          {areRepliesExpanded ? (
                            <>
                              <ChevronUp className="w-3.5 h-3.5" />
                              Hide {comment.replies?.length} {comment.replies?.length === 1 ? "reply" : "replies"}
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-3.5 h-3.5" />
                              View {comment.replies?.length} {comment.replies?.length === 1 ? "reply" : "replies"}
                            </>
                          )}
                        </button>

                        {areRepliesExpanded && (
                          <div className="mt-2 pl-4 border-l-2 border-gray-200 dark:border-neutral-800 space-y-3">
                            {comment.replies?.map((reply) => (
                              <div key={reply._id} className="flex gap-3 group/reply">
                                <Avatar className="w-7 h-7 border border-gray-200 dark:border-neutral-800 flex-shrink-0">
                                  <AvatarFallback className="text-xs bg-neutral-800 text-white font-medium">
                                    {reply.usercommented?.[0] || "U"}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold text-xs text-black dark:text-white">
                                      {reply.usercommented}
                                    </span>
                                    <span className="text-[11px] text-gray-500 dark:text-gray-400">
                                      {reply.commentedon
                                        ? formatDistanceToNow(new Date(reply.commentedon)) + " ago"
                                        : "recently"}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-800 dark:text-gray-200 mt-0.5">
                                    {reply.commentbody}
                                  </p>

                                  {(reply.userid === user?._id || comment.userid === user?._id) && (
                                    <button
                                      onClick={() => handleDeleteReply(comment._id, reply._id)}
                                      className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 mt-1 cursor-pointer"
                                      title="Delete reply"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                      Delete
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Comments;
