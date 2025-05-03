import express from "express";
import {
  sendMessage,
  getMessages,
  deleteMessage,
} from "../controllers/chat.controller.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// Route to send a message
router.post("/send", verifyToken, sendMessage);

// Route to get messages between two users
router.get("/:userId1/:userId2", verifyToken, getMessages);

// Route to delete a message by messageId
router.delete("/delete/:messageId", verifyToken, deleteMessage);


export default router;
