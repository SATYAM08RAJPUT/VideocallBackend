// import express from "express";
// import http from "http";
// import { Server } from "socket.io";
// import cors from "cors";

// const app = express();
// app.use(cors());
// const server = http.createServer(app);

// const io = new Server(server, {
//   cors: {
//     origin: "https://benevolent-llama-48fa6d.netlify.app",
//     methods: ["GET", "POST"],
//   },
// });

// const rooms = {};
// io.on("connection", (socket) => {
//   socket.on("join-room", (roomId) => {
//     const room = io.sockets.adapter.rooms.get(roomId);
//     const numClients = room ? room.size : 0;

//     socket.join(roomId);

//     if (numClients === 0) {
//       socket.emit("created");
//     } else if (numClients === 1) {
//       socket.emit("joined");
//       socket.to(roomId).emit("ready");
//     } else {
//       socket.emit("full");
//     }

//     socket.on("signal", ({ data }) => {
//       socket.to(roomId).emit("signal", { data });
//     });

//     socket.on("disconnect", () => {
//       socket.to(roomId).emit("user-left");
//     });
//   });
// });

// const PORT = 7007;
// server.listen(PORT, () =>
//   console.log(`Signaling server running on port ${PORT}`)
// );

// import express from "express";
// import http from "http";
// import { Server } from "socket.io";
// import cors from "cors";

// const app = express();
// app.use(cors());
// const server = http.createServer(app);

// const io = new Server(server, {
//   cors: {
//     origin: "https://benevolent-llama-48fa6d.netlify.app",
//     methods: ["GET", "POST"],
//   },
// });

// const rooms = {};
// io.on("connection", (socket) => {
//   socket.on("join-room", (roomId) => {
//     const room = io.sockets.adapter.rooms.get(roomId);
//     const numClients = room ? room.size : 0;

//     socket.join(roomId);

//     if (numClients === 0) {
//       socket.emit("created");
//     } else if (numClients === 1) {
//       socket.emit("joined");
//       socket.to(roomId).emit("ready");
//     } else {
//       socket.emit("full");
//     }

//     socket.on("signal", ({ data }) => {
//       socket.to(roomId).emit("signal", { data });
//     });

//     socket.on("disconnect", () => {
//       socket.to(roomId).emit("user-left");
//     });
//   });
// });

// const PORT = 7007;
// server.listen(PORT, () =>
//   console.log(`Signaling server running on port ${PORT}`)
// );
import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
app.use(cors());
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "https://benevolent-llama-48fa6d.netlify.app",
    methods: ["GET", "POST"],
  },
});

const rooms = {};

io.on("connection", (socket) => {
  socket.on("join-room", ({ roomId, userId }) => {
    socket.join(roomId);

    if (!rooms[roomId]) rooms[roomId] = [];
    rooms[roomId].push({ socketId: socket.id, userId });

    // ✅ Send both userId and socketId to the new user
    const otherUsers = rooms[roomId].filter((u) => u.socketId !== socket.id);
    socket.emit(
      "all-users",
      otherUsers.map((u) => ({
        userId: u.userId,
        socketId: u.socketId,
      }))
    );

    // ✅ Notify existing users about the new user (with socketId too if needed)
    socket.to(roomId).emit("user-joined", {
      userId,
      socketId: socket.id,
    });

    // ✅ Forward signals (SDP/ICE) between peers
    socket.on("signal", ({ to, from, data }) => {
      io.to(to).emit("signal", { from, data });
    });

    socket.on("disconnect", () => {
      const user = rooms[roomId]?.find((u) => u.socketId === socket.id);
      if (user) {
        rooms[roomId] = rooms[roomId].filter((u) => u.socketId !== socket.id);
        socket.to(roomId).emit("user-left", user.userId);
      }
    });
  });
});

const PORT = 7007;
server.listen(PORT, () => {
  console.log(`Signaling server running on port ${PORT}`);
});
