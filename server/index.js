// const express = require("express");
// require("dotenv").config();
// require('./config/database');
// const mongoose = require("mongoose");
// const http = require("http");
// const cors = require("cors");
// const { Server } = require("socket.io");
// const messageController = require("./controller/messageController");

// const PORT = process.env.PORT || 8000;
// const app = express();
// const server = http.createServer(app);

// app.use(express.json());
// app.use(cors({ origin: "*" }));



// const io = new Server(server, { cors: { origin: "*" } });

// io.on("connection", (socket) => {
//   console.log(`User connected: ${socket.id}`);

//   socket.on("joinRoom", async (room) => {
//     if (room.trim() !== "") {
//       socket.join(room);
//       console.log(`User ${socket.id} joined room: ${room}`);

//       // Send previous messages
//       const messages = await messageController.getRoomMessages(room);
//       socket.emit("previousMessages", messages);
      
//       socket.emit("roomJoined", `Joined room: ${room}`);
//     }
//   });

//   // socket.on("sendMessage", async (msg, room, sender) => {
//   //   console.log(`Message received: ${msg}, Room: ${room}`);

//   //   // Store message in database
//   //   await messageController.saveMessage(room, msg, sender);

//   //   // Send message to room members
//   //   io.to(room).emit("receiveMessage", { message: msg, sender });
//   // });

//   socket.on("sendMessage", async ({ message, room, sender }) => { 
//     console.log(`Message received from ${sender}: ${message}, Room: ${room}`);
  
//     // Store message in database
//     try {
//       await messageController.saveMessage(room, message, sender);
      
//       const msgData = { message, sender };
  
//       if (!room.trim()) {
//         io.emit("receiveMessage", msgData); // Broadcast globally
//       } else {
//         io.to(room).emit("receiveMessage", msgData); // Send to room members
//       }
//     } catch (error) {
//       console.error("Error saving message:", error);
//     }
//   });
//   socket.on("disconnect", () => {
//     console.log(`User disconnected: ${socket.id}`);
//   });
// });

// server.listen(PORT, () => {
//   console.log(`Server running on port: ${PORT}`);
// });


const express = require("express");
require("dotenv").config();
require("./config/database"); // Ensure MongoDB connection
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

const io = new Server(server, { cors: { origin: "*" } });

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("joinRoom", async (room) => {
    if (room.trim() !== "") {
      socket.join(room);
      console.log(`User ${socket.id} joined room: ${room}`);

      // Fetch previous messages via REST API instead of direct DB query
      const response = await fetch(`http://localhost:${PORT}/api/messages/${room}`);
      const data = await response.json();

      socket.emit("previousMessages", data.data);
      socket.emit("roomJoined", `Joined room: ${room}`);
    }
  });

  socket.on("sendMessage", async ({ message, room, sender }) => {
    console.log(`Message received from ${sender}: ${message}, Room: ${room}`);

    try {
      // Send message to REST API to save
      await fetch(`http://localhost:${PORT}/api/messages`, {
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
