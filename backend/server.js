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

// ✅ MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

// ✅ HTTP + Socket.io Server
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

// ✅ Routes
app.get("/entries", async (req, res) => {
  try {
    const entries = await Entry.find().sort({ date: -1 });
    res.json(entries);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch entries" });
  }
});

app.post("/entries", async (req, res) => {
  try {
    const entry = new Entry(req.body);
    await entry.save();
    io.emit("entriesUpdated");
    res.json(entry);
  } catch (error) {
    res.status(500).json({ error: "Failed to add entry" });
  }
});

// ✅ NEW: Delete entry route
app.delete("/entries/:id", async (req, res) => {
  try {
    await Entry.findByIdAndDelete(req.params.id);
    io.emit("entriesUpdated"); // notify all connected clients
    res.status(200).json({ message: "Entry deleted successfully" });
  } catch (error) {
    console.error("❌ Delete error:", error);
    res.status(500).json({ error: "Failed to delete entry" });
  }
});

// ✅ Root Route
app.get("/", (req, res) => {
  res.send("🚀 CodeSync backend is running successfully!");
});

// ✅ Socket.io connection
io.on("connection", (socket) => {
  console.log("🟢 User connected:", socket.id);
  socket.on("disconnect", () => console.log("🔴 User disconnected"));
});

// ✅ Server Listener
const PORT = process.env.PORT || 5000;
server.listen(PORT, "0.0.0.0", () =>
  console.log(`🚀 Server running on port ${PORT}`)
);
