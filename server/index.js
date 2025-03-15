const express = require("express");
require("dotenv").config();
require("./config/database");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const messageRoutes = require("./routes/messageRoutes");

const PORT = process.env.PORT || 8000;
const app = express();
const server = http.createServer(app);

app.use(express.json());
app.use(cors({ origin: "*" }));

// Register REST API routes
app.use("/api", messageRoutes);
app.get("/", (req, res) => {
  res.send("Hello World!");
})

const io = new Server(server, { cors: { origin: "*" } });

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("joinRoom", async (room) => {
    if (room.trim() !== "") {
      socket.join(room);
      console.log(`User ${socket.id} joined room: ${room}`);

      const response = await fetch(`https://legacychatapp-1.onrender.com/api/messages/${room}`);
      
      const data = await response.json();

      socket.emit("previousMessages", data.data);
      socket.emit("roomJoined", `Joined room: ${room}`);
    }
  });

  socket.on("sendMessage", async ({ message, room, sender }) => {
    console.log(`Message received from ${sender}: ${message}, Room: ${room}`);

    try {
      // Send message to REST API to save
      await fetch(`https://legacychatapp-1.onrender.com/api/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ room, sender, message }),
      });

      const msgData = { message, sender };

      if (!room.trim()) {
        io.emit("receiveMessage", msgData); // Broadcast globally
      } else {
        io.to(room).emit("receiveMessage", msgData); // Send to room members
      }
    } catch (error) {
      console.error("Error saving message:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port: ${PORT}`);
});
