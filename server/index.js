import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import path from "path";
import { createServer } from "http";
import { Server } from "socket.io";

import userroutes from "./routes/auth.js";
import videoroutes from "./routes/video.js";
import likeroutes from "./routes/like.js";
import watchlaterroutes from "./routes/watchlater.js";
import historyrroutes from "./routes/history.js";
import commentroutes from "./routes/comment.js";
import downloadroutes from "./routes/download.js";
import paymentroutes from "./routes/payment.js";

dotenv.config();

const app = express();

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json({ limit: "30mb" }));
app.use(express.urlencoded({ limit: "30mb", extended: true }));
app.use(bodyParser.json());

app.use("/uploads", express.static(path.join("uploads")));

app.get("/", (req, res) => {
  res.send("You tube backend is working");
});

app.use("/user", userroutes);
app.use("/video", videoroutes);
app.use("/like", likeroutes);
app.use("/watch", watchlaterroutes);
app.use("/history", historyrroutes);
app.use("/comment", commentroutes);

console.log("download route is working");
app.use("/download", downloadroutes);

app.use("/payment", paymentroutes);


io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join-watch-party", ({ partyId, user }) => {
    socket.join(partyId);

    console.log(`${user?.name || "User"} joined party: ${partyId}`);

    socket.to(partyId).emit("user-joined", {
      socketId: socket.id,
      user,
    });

    const room = io.sockets.adapter.rooms.get(partyId);

    io.to(partyId).emit("participants-update", {
      count: room ? room.size : 1,
    });
  });

  socket.on("video-play", ({ partyId, currentTime }) => {
    socket.to(partyId).emit("video-play", {
      currentTime,
    });
  });

  socket.on("video-pause", ({ partyId, currentTime }) => {
    socket.to(partyId).emit("video-pause", {
      currentTime,
    });
  });

  socket.on("video-seek", ({ partyId, currentTime }) => {
    socket.to(partyId).emit("video-seek", {
      currentTime,
    });
  });

  socket.on("party-message", ({ partyId, message, user }) => {
    io.to(partyId).emit("party-message", {
      message,
      user,
      socketId: socket.id,
    });
  });


  socket.on("mute-status", ({ partyId, muted, user }) => {
    socket.to(partyId).emit("mute-status", {
      socketId: socket.id,
      muted,
      user,
    });
  });

  socket.on("camera-status", ({ partyId, cameraOn, user }) => {
    socket.to(partyId).emit("camera-status", {
      socketId: socket.id,
      cameraOn,
      user,
    });
  });

  socket.on("leave-watch-party", ({ partyId, user }) => {
    socket.leave(partyId);

    socket.to(partyId).emit("user-left", {
      socketId: socket.id,
      user,
    });

    const room = io.sockets.adapter.rooms.get(partyId);

    io.to(partyId).emit("participants-update", {
      count: room ? room.size : 0,
    });

    console.log(`${user?.name || "User"} left party: ${partyId}`);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});


const DBURL = process.env.DB_URL;

mongoose
  .connect(DBURL)
  .then(() => {
    console.log("Mongodb connected");
  })
  .catch((error) => {
    console.log(error);
  });


const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`server running on port ${PORT}`);
  console.log(`Watch Party Socket.IO running on port ${PORT}`);
});