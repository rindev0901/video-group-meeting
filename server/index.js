const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const PORT = process.env.PORT || 3001;
const path = require("path");

let socketList = {};

app.use(express.static(path.join(__dirname, "public")));

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/build")));

  app.get("/*", function (req, res) {
    res.sendFile(path.join(__dirname, "../client/build/index.html"));
  });
}

// Route
app.get("/ping", (req, res) => {
  res
    .send({
      success: true,
      env: process.env.NODE_ENV ?? "development",
    })
    .status(200);
});

// Socket
io.on("connection", (socket) => {
  console.log(`New User connected: ${socket.id}`);

  socket.on("disconnect", () => {
    delete socketList[socket.id];
    console.log("User disconnected:", socket.id);
  });

  socket.on("BE-check-user", ({ roomId, userName }) => {
    console.log(`Checking user in room ${roomId}:`, userName);
    let error = false;

    const room = io.sockets.adapter.rooms.get(roomId);
    if (room) {
      for (const clientId of room) {
        if (socketList[clientId]?.userName === userName) {
          error = true;
          break;
        }
      }
    }

    console.log("User exists?", error);
    socket.emit("FE-error-user-exist", { error });
  });

  /**
   * Join Room
   */
  socket.on("BE-join-room", ({ roomId, userName }) => {
    // Socket Join RoomName
    socket.join(roomId);
    socketList[socket.id] = { userName, video: true, audio: true };

    // Set User List
    const room = io.sockets.adapter.rooms.get(roomId);
    try {
      const users = [];
      if (room) {
        for (const clientId of room) {
          // Add User List
          users.push({ userId: clientId, info: socketList[clientId] });
        }
      }
      socket.broadcast.to(roomId).emit("FE-user-join", users);
    } catch (e) {
      console.error("Error in BE-join-room:", e);
      io.sockets.in(roomId).emit("FE-error-user-exist", { err: true });
    }
  });

  socket.on("BE-call-user", ({ userToCall, from, signal }) => {
    io.to(userToCall).emit("FE-receive-call", {
      signal,
      from,
      info: socketList[socket.id],
    });
  });

  socket.on("BE-accept-call", ({ signal, to }) => {
    io.to(to).emit("FE-call-accepted", {
      signal,
      answerId: socket.id,
    });
  });

  socket.on("BE-send-message", ({ roomId, msg, sender }) => {
    io.sockets.in(roomId).emit("FE-receive-message", { msg, sender });
  });

  socket.on("BE-leave-room", ({ roomId, leaver }) => {
    delete socketList[socket.id];
    socket.broadcast
      .to(roomId)
      .emit("FE-user-leave", { userId: socket.id, userName: [socket.id] });
    io.sockets.sockets[socket.id].leave(roomId);
  });

  socket.on("BE-toggle-camera-audio", ({ roomId, switchTarget }) => {
    if (switchTarget === "video") {
      socketList[socket.id].video = !socketList[socket.id].video;
    } else {
      socketList[socket.id].audio = !socketList[socket.id].audio;
    }
    socket.broadcast
      .to(roomId)
      .emit("FE-toggle-camera", { userId: socket.id, switchTarget });
  });
});

// Error handling for socket.io
io.engine.on("connection_error", (err) => {
  console.log("Socket.io connection error:", err);
});

http.listen(PORT, () => {
  console.log(`Server running on port: ${PORT}`);
});
