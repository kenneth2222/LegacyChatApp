const express = require("express");
const messageRouter = express.Router();
const {saveMessage, getRoomMessages}= require("../controller/messageController");

messageRouter.post("/messages", saveMessage);
messageRouter.get("/messages/:room", getRoomMessages);

module.exports = messageRouter;
