const Message = require("../model/message");

// Save a message
exports.saveMessage = async (req, res) => {
  try {
    const { roomPayload, sender, message } = req.body;

    if (!roomPayload || !sender || !message) {
      return res.status(400).json({
        success: false,
        message: "All fields (room, sender, message) are required",
      });
    }

    const newMessage = new Message({
      // room: roomPayload.toLowerCase(),
      room: roomPayload,
      sender,
      message,
      timestamp: new Date(), // Ensure timestamp is stored
    });

    await newMessage.save();

    res.status(201).json({
      success: true,
      message: "Message saved",
      data: newMessage,
    });
  } catch (error) {
    console.error("Error saving message:", error);
    res.status(500).json({
      success: false,
      message: "Error saving message: " + error.message,
    });
  }
};

// Get messages for a specific room
exports.getRoomMessages = async (req, res) => {
  try {
    const { room } = req.params;

    if (!room) {
      return res.status(400).json({
        success: false,
        message: "Room parameter is required",
      });
    }

    // const roomToLowerCase = room.toLowerCase();
    // const messages = await Message.find({ room: roomToLowerCase }).sort({ timestamp: 1 }); // Sort oldest to newest
    const messages = await Message.find({ room }).sort({ timestamp: 1 }); // Sort oldest to newest

    res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching messages: " + error.message,
    });
  }
};
