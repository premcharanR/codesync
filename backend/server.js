import express from "express";
import mongoose from "mongoose";
import { Server } from "socket.io";
import http from "http";
import cors from "cors";
import dotenv from "dotenv";
import Entry from "./models/Entry.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

// HTTP + Socket.io Server
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

// Routes
app.get("/entries", async (req, res) => {
  const entries = await Entry.find().sort({ date: -1 });
  res.json(entries);
});

app.post("/entries", async (req, res) => {
  const entry = new Entry(req.body);
  await entry.save();
  io.emit("entriesUpdated");
  res.json(entry);
});

// Socket connection
io.on("connection", (socket) => {
  console.log("🟢 User connected:", socket.id);
  socket.on("disconnect", () => console.log("🔴 User disconnected"));
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
