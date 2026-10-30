import express from "express";
import {
  getallwatchlater,
  handlewatchlater,
  deletewatchlater,
} from "../controllers/watchlater.js";

const routes = express.Router();
routes.get("/:userId", getallwatchlater);
routes.post("/:videoId", handlewatchlater);
routes.delete("/:id", deletewatchlater);
export default routes;
