import Message from "../models/Message.js"; // New syntax
import { io } from '../index.js'; // Adjust the path accordingly


import express from "express";
import {
  sendMessage,
  getMessages,
  deleteMessage,
} from "../controllers/chat.controller.js";
import { verifyToken } from "../middleware/auth.js";


const router = express.Router();

router.post("/send", async (req, res) => {
  const { senderId, receiverId, message } = req.body;

  try {
    const newMessage = new Message({
      senderId,
      receiverId,
      message,
      createdAt: Date.now(),
    });
    await newMessage.save();

    // Emit the message to the receiver
    io.to(receiverId).emit("getMessage", newMessage);
    return res.status(200).json(newMessage);
  } catch (error) {
    console.error("Error sending message:", error);
    return res.status(500).json({ error: "Failed to send message" });
  }
});

// Route for fetching messages
router.get("/:userId/:receiverId", async (req, res) => {
  const { userId, receiverId } = req.params;

  try {
    const messages = await Message.find({
      $or: [
        { senderId: userId, receiverId },
        { senderId: receiverId, receiverId: userId },
      ],
    }).sort({ createdAt: 1 });

    return res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    return res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// Route for deleting a message
router.delete("/delete/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const message = await Message.findById(id);
    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    await message.delete();
    io.to(message.receiverId).emit("deleteMessage", id);
    return res.status(200).json({ success: "Message deleted" });
  } catch (error) {
    console.error("Error deleting message:", error);
    return res.status(500).json({ error: "Failed to delete message" });
  }
});

export default router;
