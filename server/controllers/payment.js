import Razorpay from "razorpay";
import dotenv from "dotenv";
import crypto from "crypto";
import users from "../Modals/Auth.js";
import nodemailer from "nodemailer";

dotenv.config();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const createOrder = async (req, res) => {
  try {
    console.log(req.body);
    const { amount } = req.body;
    const options = {
      amount: amount * 100,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    res.status(200).json(order);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "failsd to create payment order",
      error: error.message,
    });
  }
};

export const verifyPayment = async (req, res) => {
  console.log("VERIFY API HIT");
  console.log("VERIFY BODY:", req.body);

  try {
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      plan,
      userId,
    } = req.body;

    if (
      !razorpay_payment_id ||
      !razorpay_order_id ||
      !razorpay_signature ||
      !plan ||
      !userId
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing payment details",
      });
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      console.log("INVALID PAYMENT SIGNATURE");

      return res.status(400).json({
        success: false,
        message: "Invalid payment signature",
      });
    }

    const updatedUser = await users.findByIdAndUpdate(
      userId,
      {
        $set: {
          plan: plan,
          subscription: "Active",
          planPurchasedAt: new Date(),
          transactionId: razorpay_payment_id,
        },
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    console.log("USER PLAN UPDATED:", updatedUser);

    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: updatedUser.email,
        subject: "YourTube Subscription Confirmation",
        html: `
          <h2>Payment Successful!</h2>
          <p>Hi ${updatedUser.name || "User"},</p>
          <p>Your YourTube subscription has been successfully activated.</p>
          <p><strong>Plan:</strong> ${updatedUser.plan}</p>
          <p><strong>Transaction ID:</strong> ${updatedUser.transactionId}</p>
          <p><strong>Purchase Date:</strong> ${updatedUser.planPurchasedAt}</p>
          <p>Thank you for subscribing to YourTube!</p>
        `,
      });

      console.log("CONFIRMATION EMAIL SENT");
    } catch (emailError) {
      console.log("EMAIL FAILED:", emailError.message);
      console.log("Payment is still successful.");
    }

    console.log("Payment signature verified");

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      plan: updatedUser.plan,
    });
  } catch (error) {
    console.log("Verification Error:", error);

    return res.status(500).json({
      success: false,
      message: "Payment verification failed",
      error: error.message,
    });
  }
};