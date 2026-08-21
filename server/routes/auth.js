import express from "express";
import { login, updateprofile,verifyOTP } from "../controllers/auth.js";
const routes = express.Router();

routes.post("/login", login);
routes.post("/verify-otp",verifyOTP);
routes.patch("/update/:id", updateprofile);
export default routes;
