// const Message = require("../model/message");

// exports.saveMessage = async (room, message, sender) => {
//   try {
//     const newMessage = new Message({ room, message, sender });
//     await newMessage.save();
//   } catch (err) {
//     console.error("Error saving message:", err);
//   }
// };

// exports.getRoomMessages = async (room) => {
//   try {
//     return await Message.find({ room }).sort({ timestamp: 1 });
//   } catch (err) {
//     console.error("Error fetching messages:", err);
//     return [];
//   }
// };


const Message = require("../model/message");

// Save a message
exports.saveMessage = async (req, res) => {
  try {
    const { room, sender, message } = req.body;

    const newMessage = new Message({ room, sender, message });
    await newMessage.save();

    res.status(201).json({ success: true, 
        message: "Message saved", 
        data: newMessage });
  } catch (error) {
    res.status(500).json({ 
        success: false, 
        message: "Error saving message" + error.message });
  }
};

// Get messages for a specific room
exports.getRoomMessages = async (req, res) => {
  try {
    const { room } = req.params;
    const messages = await Message.find({ room }).sort("timestamp");

    res.status(200).json({ 
        success: true, 
        data: messages 
    });
  } catch (error) {
    res.status(500).json({ 
        success: false, 
        message: "Error fetching messages" + error.message
    });
  }
};
