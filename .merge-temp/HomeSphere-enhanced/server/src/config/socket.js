import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { getAllowedOrigins, getJwtSecret } from "./env.js";

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: getAllowedOrigins(),
      methods: ["GET", "POST"],
    },
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) {
        return next(new Error("Unauthorized"));
      }
      const decoded = jwt.verify(token, getJwtSecret());
      const user = await User.findById(decoded.id).select("_id role name");
      socket.user = user;
      next();
    } catch (error) {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    socket.join(`user:${socket.user._id}`);
    socket.on("join-provider-room", () => {
      if (socket.user.role === "provider") {
        socket.join(`provider:${socket.user._id}`);
      }
    });
  });

  return io;
};

export const emitNotification = (userId, payload) => {
  if (io) {
    io.to(`user:${userId}`).emit("notification", payload);
  }
};
