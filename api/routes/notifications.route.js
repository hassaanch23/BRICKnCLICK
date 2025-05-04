import express from "express";
import Message from "../models/Message.js";
import { markNotificationAsRead } from "../controllers/chat.controller.js";

const router = express.Router();

router.get("/:userId", async (req, res) => {
  try {
    const messages = await Message.find({ receiverId: req.params.userId, deleted: { $ne: true } })
      .populate("senderId", "username")
      .populate("listingId", "title")
      .sort({ createdAt: -1 });

      // Group by sender and listing (avoid duplicates)
      const seen = new Set();
      const uniqueNotifications = messages.filter((msg) => {
        const key = `${msg.senderId._id}_${msg.listingId._id}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      
      res.json(
        uniqueNotifications.map((msg) => ({
          _id: msg._id,
          fromUser: msg.senderId.username,
          listingId: msg.listingId._id,
          propertyTitle: msg.listingId.title,
          sentAt: msg.sentAt,
        }))
      );
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch notifications" });
    }
  });

  // Mark notification as read
router.put("/mark-read/:notifId", markNotificationAsRead);

export default router;
  