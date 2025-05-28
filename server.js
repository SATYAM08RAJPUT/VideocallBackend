import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
app.use(cors());
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // ✅ Adjust based on frontend port
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("🔌 New client connected:", socket.id);

  socket.on("join-room", (roomId) => {
    const room = io.sockets.adapter.rooms.get(roomId);
    const numClients = room ? room.size : 0;

    socket.join(roomId);

    if (numClients === 0) {
      socket.emit("created");
      console.log(`🟢 Room ${roomId} created by ${socket.id}`);
    } else if (numClients === 1) {
      socket.emit("joined");
      socket.to(roomId).emit("ready");
      console.log(`🟡 ${socket.id} joined room ${roomId}`);
    } else {
      socket.emit("full");
      console.log(`🔴 Room ${roomId} full`);
    }
  });

  socket.on("signal", ({ roomId, data }) => {
    socket.to(roomId).emit("signal", { data });
  });

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
    // Optionally: Broadcast that user left
    socket.broadcast.emit("user-left");
  });
});

const PORT = 7007;
server.listen(PORT, () =>
  console.log(`✅ Signaling server running on port ${PORT}`)
);
