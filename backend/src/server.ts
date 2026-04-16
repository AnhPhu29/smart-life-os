import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import authRoutes from "./routes/auth";
import taskRoutes from "./routes/tasks";
import scheduleRoutes from "./routes/schedules";
import analyticsRoutes from "./routes/analytics";

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
    credentials: true,
  },
});

const PORT = process.env.PORT || 8080;

app.use(
  cors({
    origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
    credentials: true,
  }),
);

app.use(express.json());

// Store io instance globally for routes
(globalThis as any).io = io;

// Socket.io connection handling
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Join user room for personalized updates
  socket.on("join-user-room", (userId: number) => {
    socket.join(`user-${userId}`);
    console.log(`User ${userId} joined personal room`);
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/tasks", taskRoutes);
app.use("/api/v1/schedules", scheduleRoutes);
app.use("/api/v1/analytics", analyticsRoutes);

app.get("/api/v1/actuator/health", (req, res) => {
  res.status(200).json({ status: "UP" });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
