import mongoose from "mongoose";
const downloadschema = mongoose.Schema({
  userid: { type: mongoose.Schema.Types.ObjectId, ref: "user", requied: true },

  videoid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "videofiles",
    required: true,
  },

  userplan: { type: String, enum: ["free", "premium"], default: "free" },

  downloadedat: { type: Date, default: Date.now },
});

export default mongoose.model("download", downloadschema);
