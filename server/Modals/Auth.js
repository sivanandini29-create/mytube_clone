import mongoose from "mongoose";

const userschema = mongoose.Schema({
  email: {
    type: String,
    required: true,
  },

  name: {
    type: String,
  },

  channelname: {
    type: String,
  },

  description: {
    type: String,
  },

  image: {
    type: String,
  },

  joinedon: {
    type: Date,
    default: Date.now,
  },

  // OTP SECURITY
  otp: {
    type: String,
    default: null,
  },

  otpExpiresAt: {
    type: Date,
    default: null,
  },

  otpAttempts: {
    type: Number,
    default: 0,
  },

  plan: {
    type: String,
    enum: ["free", "Bronze", "Silver", "Gold"],
    default: "free",
  },

  subscription: {
    type: String,
    enum: ["Active", "Inactive"],
    default: "Inactive",
  },

  planPurchasedAt: {
    type: Date,
    default: null,
  },

  transactionId: {
    type: String,
    default: "",
  },
});

export default mongoose.model("user", userschema);