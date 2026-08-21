import mongoose from "mongoose";
import users from "../Modals/Auth.js";

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const login = async (req, res) => {
  const { email, name, image } = req.body;

  try {
    let existingUser = await users.findOne({ email });

    const otp = generateOTP();

    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

    if (!existingUser) {
      const newUser = await users.create({
        email,
        name,
        image,
        otp,
        otpExpiresAt,
      });

      console.log("Generated OTP:", otp);

      return res.status(201).json({
        message: "OTP generated",
        requiresOtp: true,
        userId: newUser._id,
      });
    } else {
      existingUser.otp = otp;
      existingUser.otpExpiresAt = otpExpiresAt;

      await existingUser.save();

      console.log("Generated OTP:", otp);

      return res.status(200).json({
        message: "OTP generated",
        requiresOtp: true,
        userId: existingUser._id,
      });
    }
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

export const verifyOTP = async (req, res) => {
  const { userId, otp } = req.body;

  try {
    console.log("VERIFY OTP REQUEST:");
    console.log("userId:", userId);
    console.log("otp:", otp);

    if (!userId || !otp) {
      return res.status(400).json({
        message: "User ID and OTP are required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        message: "Invalid user ID",
      });
    }

    const user = await users.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    console.log("DB OTP:", user.otp);
    console.log("ENTERED OTP:", String(otp));
    console.log("OTP EXPIRES:", user.otpExpiresAt);

    if (!user.otp || !user.otpExpiresAt) {
      return res.status(400).json({
        message: "OTP not found. Please request a new OTP",
      });
    }

    if (new Date() > new Date(user.otpExpiresAt)) {
      user.otp = null;
      user.otpExpiresAt = null;
      user.otpAttempts = 0;

      await user.save();

      return res.status(400).json({
        message: "OTP expired. Please request a new OTP",
      });
    }

    if (user.otpAttempts >= 5) {
      user.otp = null;
      user.otpExpiresAt = null;
      user.otpAttempts = 0;

      await user.save();

      return res.status(429).json({
        message: "Too many incorrect attempts. Please request a new OTP",
      });
    }

    const enteredOTP = String(otp).trim();
    const savedOTP = String(user.otp).trim();

    if (savedOTP !== enteredOTP) {
      user.otpAttempts += 1;

      await user.save();

      return res.status(400).json({
        message: `Invalid OTP. ${
          5 - user.otpAttempts
        } attempts remaining`,
      });
    }

    user.otp = null;
    user.otpExpiresAt = null;
    user.otpAttempts = 0;

    await user.save();

    console.log("OTP VERIFIED SUCCESSFULLY");

    return res.status(200).json({
      message: "OTP verified successfully",
      result: user,
    });
  } catch (error) {
    console.error("OTP verification error:", error);

    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

export const updateprofile = async (req, res) => {
  const { id: _id } = req.params;
  const { channelname, description } = req.body;

  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(500).json({
      message: "User unavailable...",
    });
  }

  try {
    const updatedata = await users.findByIdAndUpdate(
      _id,
      {
        $set: {
          channelname: channelname,
          description: description,
        },
      },
      { new: true }
    );

    return res.status(201).json(updatedata);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};
