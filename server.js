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

io.on("connection", (socket) => {
  socket.on("join-room", (roomId, userId) => {
    socket.join(roomId);

    // Notify others in the room that a new user joined
    socket.to(roomId).emit("user-joined", userId);

    // Relay signal data between users
    socket.on("signal", ({ to, from, data }) => {
      io.to(to).emit("signal", { from, data });
    });

    // Notify others when a user leaves
    socket.on("disconnect", () => {
      socket.to(roomId).emit("user-left", userId);
    });
  });
});

const PORT = 7007;
server.listen(PORT, () => {
  console.log(`Signaling server running on port ${PORT}`);
});
