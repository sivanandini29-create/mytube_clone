import express from "express";
import { login, signup, updateprofile, verifyOTP, sendLoginOtp } from "../controllers/auth.js";
const routes = express.Router();

routes.post("/signup", signup);
routes.post("/login", login);
routes.post("/send-login-otp", sendLoginOtp);
routes.post("/verify-otp", verifyOTP);
routes.patch("/update/:id", updateprofile);
export default routes;
