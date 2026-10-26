import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import users from "../Modals/Auth.js";

dotenv.config();

const getTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const validateUsername = (username) => {
  if (!username || typeof username !== "string") return false;
  // Username must only contain letters and numbers, NO special characters allowed
  return /^[a-zA-Z0-9]+$/.test(username.trim());
};

export const validatePassword = (password) => {
  if (!password || typeof password !== "string") return false;
  return password.length >= 6;
};

export const validateEmail = (email) => {
  if (!email || typeof email !== "string") return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

const maskEmail = (email) => {
  if (!email || !email.includes("@")) return "";
  const [local, domain] = email.split("@");
  if (local.length <= 2) return `${local[0]}***@${domain}`;
  return `${local[0]}***${local[local.length - 1]}@${domain}`;
};

export const sendOtpEmail = async (toEmail, otp, username) => {
  try {
    const transporter = getTransporter();
    const info = await transporter.sendMail({
      from: `"myTube Security" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: `Your myTube Login OTP: ${otp}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #ffffff;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #ef4444; font-size: 26px; margin: 0; font-weight: bold;">myTube</h1>
            <p style="color: #6b7280; font-size: 13px; margin-top: 4px;">Sign-In Verification</p>
          </div>
          <p style="font-size: 15px; color: #111827;">Hello <strong>${username || "User"}</strong>,</p>
          <p style="font-size: 14px; color: #4b5563; line-height: 1.5;">You requested a One-Time Password (OTP) to sign in to your myTube account. Use the code below to complete your login:</p>
          
          <div style="background: linear-gradient(135deg, #fef2f2, #fee2e2); border: 2px dashed #ef4444; border-radius: 10px; padding: 18px; text-align: center; margin: 24px 0;">
            <span style="font-family: monospace; font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #dc2626;">${otp}</span>
          </div>

          <p style="font-size: 13px; color: #6b7280; line-height: 1.4;">This OTP is valid for <strong>10 minutes</strong>. For security reasons, please do not share this code with anyone.</p>
          <hr style="border: 0; border-top: 1px solid #f3f4f6; margin: 20px 0;" />
          <p style="font-size: 11px; color: #9ca3af; text-align: center; margin: 0;">If you did not request this OTP, please ignore this email or change your password.</p>
        </div>
      `,
    });
    console.log(`[AUTH] OTP email successfully sent to ${toEmail}. MessageId: ${info.messageId}`);
    return { success: true };
  } catch (error) {
    console.warn(`[AUTH] Nodemailer send failed: ${error.message}`);
    return { success: false, error: error.message };
  }
};

export const sendLoginOtp = async (req, res) => {
  const { username, password } = req.body;

  try {
    if (!username) {
      return res.status(400).json({
        message: "Username is required",
      });
    }

    const cleanUsername = username.trim();

    // Check special characters in username
    if (!validateUsername(cleanUsername)) {
      return res.status(400).json({
        message: "Special characters are not allowed in username. Use letters and numbers only.",
      });
    }

    const existingUser = await users.findOne({
      $or: [
        { username: cleanUsername },
        { name: cleanUsername },
        { email: cleanUsername.toLowerCase() },
      ],
    });

    if (!existingUser) {
      return res.status(404).json({
        message: "No account found with this username. Please sign up.",
      });
    }

    if (password && existingUser.password) {
      const isPasswordValid = await bcrypt.compare(password, existingUser.password);
      if (!isPasswordValid) {
        return res.status(400).json({
          message: "Invalid password",
        });
      }
    }

    const otp = generateOTP();
    existingUser.otp = otp;
    existingUser.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    existingUser.otpAttempts = 0;
    await existingUser.save();

    console.log(`[AUTH] Generated OTP for ${existingUser.email} (${existingUser.username || existingUser.name}):`, otp);

    const emailResult = await sendOtpEmail(
      existingUser.email,
      otp,
      existingUser.username || existingUser.name
    );

    return res.status(200).json({
      success: true,
      message: `OTP sent to your email address (${maskEmail(existingUser.email)})`,
      emailHint: maskEmail(existingUser.email),
      userId: existingUser._id,
      devOtp: process.env.NODE_ENV !== "production" ? otp : undefined,
      emailSent: emailResult.success,
    });
  } catch (error) {
    console.error("sendLoginOtp error:", error);
    return res.status(500).json({
      message: "Failed to send OTP. Please try again.",
    });
  }
};

export const signup = async (req, res) => {
  const { username, name, email, password } = req.body;

  try {
    const chosenUsername = (username || name)?.trim();

    if (!chosenUsername) {
      return res.status(400).json({
        message: "Username is required",
      });
    }

    // Special characters are NOT allowed in username
    if (!validateUsername(chosenUsername)) {
      return res.status(400).json({
        message: "Special characters are not allowed in username. Use letters and numbers only.",
      });
    }

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const trimmedEmail = email.trim().toLowerCase();

    if (!validateEmail(trimmedEmail)) {
      return res.status(400).json({
        message: "Please enter a valid email address",
      });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({
        message: "Password must contain at least 6 characters",
      });
    }

    const existingUsername = await users.findOne({
      $or: [{ username: chosenUsername }, { name: chosenUsername }],
    });
    if (existingUsername) {
      return res.status(400).json({
        message: "This username is already taken. Please choose another username.",
      });
    }

    const existingUser = await users.findOne({ email: trimmedEmail });
    if (existingUser) {
      return res.status(400).json({
        message: "An account with this email already exists. Please sign in.",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await users.create({
      email: trimmedEmail,
      username: chosenUsername,
      name: chosenUsername,
      channelname: chosenUsername,
      password: hashedPassword,
      image: "https://github.com/shadcn.png",
    });

    const userObject = newUser.toObject();
    delete userObject.password;
    delete userObject.otp;

    return res.status(201).json({
      message: "Account created successfully",
      result: userObject,
    });
  } catch (error) {
    console.error("Signup error:", error.message);
    return res.status(500).json({
      message: "Something went wrong during signup",
    });
  }
};

export const login = async (req, res) => {
  const { username, email, password, otp, name, image } = req.body;

  try {
    // 1. Password/Username + OTP based login
    if (password !== undefined) {
      const loginIdentifier = (username || email)?.trim();

      if (!loginIdentifier) {
        return res.status(400).json({
          message: "Username is required",
        });
      }

      // If logging in with username, reject if it has special characters
      if (username && !validateUsername(username.trim())) {
        return res.status(400).json({
          message: "Special characters are not allowed in username. Use letters and numbers only.",
        });
      }

      const existingUser = await users.findOne({
        $or: [
          { username: loginIdentifier },
          { name: loginIdentifier },
          { email: loginIdentifier.toLowerCase() },
        ],
      });

      if (!existingUser) {
        return res.status(404).json({
          message: "User not found. Please sign up to create an account.",
        });
      }

      if (!existingUser.password) {
        return res.status(400).json({
          message: "This account was registered using Google/GitHub. Please sign in with social login.",
        });
      }

      const isPasswordValid = await bcrypt.compare(
        password,
        existingUser.password
      );

      if (!isPasswordValid) {
        return res.status(400).json({
          message: "Invalid username or password",
        });
      }

      // If OTP was provided, verify it directly
      if (otp) {
        const enteredOTP = String(otp).trim();
        const savedOTP = String(existingUser.otp || "").trim();

        if (!existingUser.otp || !existingUser.otpExpiresAt) {
          return res.status(400).json({
            message: "OTP not found or expired. Please request a new OTP.",
          });
        }

        if (new Date() > new Date(existingUser.otpExpiresAt)) {
          existingUser.otp = null;
          existingUser.otpExpiresAt = null;
          existingUser.otpAttempts = 0;
          await existingUser.save();
          return res.status(400).json({
            message: "OTP has expired. Please click 'Send OTP' to get a fresh code.",
          });
        }

        if (existingUser.otpAttempts >= 5) {
          existingUser.otp = null;
          existingUser.otpExpiresAt = null;
          existingUser.otpAttempts = 0;
          await existingUser.save();
          return res.status(429).json({
            message: "Too many incorrect attempts. Please request a new OTP.",
          });
        }

        if (savedOTP !== enteredOTP) {
          existingUser.otpAttempts = (existingUser.otpAttempts || 0) + 1;
          await existingUser.save();
          return res.status(400).json({
            message: `Invalid OTP. ${5 - existingUser.otpAttempts} attempts remaining.`,
          });
        }

        // OTP Verified successfully!
        existingUser.otp = null;
        existingUser.otpExpiresAt = null;
        existingUser.otpAttempts = 0;
        await existingUser.save();

        const safeUser = existingUser.toObject();
        delete safeUser.password;
        delete safeUser.otp;

        return res.status(200).json({
          message: "Login successful",
          result: safeUser,
        });
      }

      // If OTP is NOT yet provided, automatically generate and send OTP to their email
      const newOtp = generateOTP();
      existingUser.otp = newOtp;
      existingUser.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
      existingUser.otpAttempts = 0;
      await existingUser.save();

      console.log(`[AUTH] Generated OTP for ${existingUser.email}:`, newOtp);
      sendOtpEmail(existingUser.email, newOtp, existingUser.username || existingUser.name);

      return res.status(200).json({
        message: `OTP sent to your email address (${maskEmail(existingUser.email)}). Please enter it to complete sign in.`,
        requiresOtp: true,
        userId: existingUser._id,
        emailHint: maskEmail(existingUser.email),
        devOtp: process.env.NODE_ENV !== "production" ? newOtp : undefined,
      });
    }

    // 2. Social login (Google / GitHub)
    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    const trimmedEmail = email.trim().toLowerCase();
    let existingUser = await users.findOne({ email: trimmedEmail });

    if (!existingUser) {
      const generatedUsername = (name || trimmedEmail.split("@")[0]).replace(/[^a-zA-Z0-9]/g, "") || `user${Math.floor(1000 + Math.random() * 9000)}`;

      existingUser = await users.create({
        email: trimmedEmail,
        username: generatedUsername,
        name: name || generatedUsername,
        channelname: name || generatedUsername,
        image: image || "https://github.com/shadcn.png",
      });
    }

    const userObject = existingUser.toObject();
    delete userObject.password;
    delete userObject.otp;

    return res.status(200).json({
      message: "Social login successful",
      result: userObject,
    });
  } catch (error) {
    console.error("Login error:", error.message);
    return res.status(500).json({
      message: "Something went wrong during login",
    });
  }
};

export const verifyOTP = async (req, res) => {
  const { userId, otp } = req.body;

  try {
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
      user.otpAttempts = (user.otpAttempts || 0) + 1;
      await user.save();

      return res.status(400).json({
        message: `Invalid OTP. ${5 - user.otpAttempts} attempts remaining`,
      });
    }

    user.otp = null;
    user.otpExpiresAt = null;
    user.otpAttempts = 0;
    await user.save();

    console.log("OTP VERIFIED SUCCESSFULLY FOR USER:", user._id);

    const safeUser = user.toObject();
    delete safeUser.password;
    delete safeUser.otp;

    return res.status(200).json({
      message: "OTP verified successfully",
      result: safeUser,
    });
  } catch (error) {
    console.error("OTP verification error:", error);
    return res.status(500).json({
      message: "Something went wrong during OTP verification",
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
