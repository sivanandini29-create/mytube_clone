import express from "express";
import { handlelike, getallLikedVideo, deletelike } from "../controllers/like.js";

const routes = express.Router();
routes.get("/:userId", getallLikedVideo);
routes.post("/:videoId", handlelike);
routes.delete("/:id", deletelike);
export default routes;
