

import { useEffect, useState } from "react";
import io from "socket.io-client";
import "./App.css";

// const socket = io.connect("http://localhost:8000");
// const socket = io.connect("http://localhost:8000");
const socket = io.connect("https://legacychatapp-1.onrender.com");

const App = () => {
  const [responses, setResponses] = useState([]);
  const [input, setInput] = useState("");
  const [room, setRoom] = useState("");
  const [username, setUsername] = useState("");


  const sendMessage = () => {
    if (input.trim() !== "" && room.trim() !== "") {
      socket.emit("sendMessage", { message: input, room, sender: username });
      setInput(""); // Clear input but don't add to state
    } else {
      alert("Invalid input or room not selected.");
    }
  };
  

  const joinRoom = () => {
    if (room.trim() !== "") {
      socket.emit("joinRoom", room);
    } else {
      alert("Please enter a valid room name.");
    }
  };

  useEffect(() => {
    socket.on("receiveMessage", (msg) => {
      setResponses((prev) => [...prev, msg]);
    });

    socket.on("previousMessages", (messages) => {
      setResponses(messages);
    });

    socket.on("roomJoined", (msg) => {
      alert(msg);
    });

    return () => {
      socket.off("receiveMessage");
      socket.off("previousMessages");
      socket.off("roomJoined");
      socket.disconnect();
    };
  }, []);

  return (
    <div className="chat-container">
      <h1 className="title">Legacy Builders</h1>

      <div className="input-section">
        <input
          type="text"
          onChange={(e) => setUsername(e.target.value)}
          value={username}
          placeholder="Enter your name"
        />
      </div>

      <div className="room-section">
        <input
          type="text"
          onChange={(e) => setRoom(e.target.value)}
          value={room}
          placeholder="Enter room name"
        />
        <button onClick={joinRoom}>Join Room</button>
      </div>

      <div className="message-section">
        <input
          type="text"
          onChange={(e) => setInput(e.target.value)}
          value={input}
          placeholder="Type a message..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>

      <div className="messages">
        {responses.length === 0 ? (
          <p className="placeholder">Your chats will show here</p>
        ) : (
          responses.map((msg, index) => (
            <p key={index} className={msg.sender === username ? "user-message" : "received-message"}>
              <strong>{msg.sender}: </strong> {msg.message}
            </p>
          ))
        )}
      </div>
    </div>
  );
};

export default App;
