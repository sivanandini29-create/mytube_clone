import express from "express";
import { downloadVideo, getDownloads } from "../controllers/download.js";

const router = express.Router();

router.post("/:videoId", downloadVideo);
router.get("/:userId", getDownloads);

export default router;
