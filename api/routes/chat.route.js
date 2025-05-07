import express from "express";
import { verifyToken } from "../middleware/auth.js";
import {
  sendMessage,
  getMessages,
  deleteMessage
} from "../controllers/chat.controller.js";

const router = express.Router();

// Send message (protected)
router.post("/send", verifyToken, sendMessage);

// Get messages between two users (open or protect as needed)
router.get("/:userId1/:userId2", getMessages);

// Delete a message (protected)
router.delete("/delete/:messageId", verifyToken, deleteMessage);

export default router;
