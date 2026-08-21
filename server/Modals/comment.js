import mongoose from "mongoose";

const reportschema = mongoose.Schema({
  userrId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  reason: {
    type: String,
    default: "inappropriate content",
  },
  reportedAt: {
    type: Date,
    default: Date.now,
  },
});

const commentschema = mongoose.Schema(
  {
    userid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    videoid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "videofiles",
      required: true,
    },

    commentbody: { type: String },
    usercommented: { type: String },

    language: {
      type: String,
      default: "en",
    },

    location: {
      type: String,
      default: "",
    },

    showlocation: {
      type: Boolean,
      default: false,
    },

    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
      },
    ],

    dislikes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
      },
    ],

    reports: [reportschema],

    isflagged: {
      type: Boolean,
      default: false,
    },

    commentedon: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("comment", commentschema);
