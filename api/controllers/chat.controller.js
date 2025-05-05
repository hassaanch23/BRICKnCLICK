  import Message from "../models/Message.js";
  import { Server } from "socket.io";
  import { createNotification } from "./notifications.controller.js";
  import Listing from "../models/listing.model.js";
  import { verifyToken } from "../middleware/auth.js";

  // Get messages between two users
  export const getMessages = async (req, res) => {
    const { userId1, userId2 } = req.params;
    try {

      const messages = await Message.find({
        $or: [
          { senderId: userId1, receiverId: userId2 },
          { senderId: userId2, receiverId: userId1 },
        ],
        deleted: { $ne: true },
      })
      .populate('senderId', 'username photo')
        .populate('receiverId', 'username photo')
        .populate('listingId', 'title')
        .sort({ sentAt: 1 });

      res.status(200).json(messages);
    } catch (error) {
      res.status(500).json({ message: "Error fetching messages", error });
    }
  };

  // Save a new message (this can be used if you want to store a message in a specific way)
  export const saveMessage = async (req, res) => {
    const { senderId, receiverId, text, listingId } = req.body;

    try {
      // Save message
      const newMessage = new Message({
        senderId,
        receiverId,
        message: text,
        listingId,
        sentAt: new Date(),
        read: false,
      });

      await newMessage.save();
      console.log("📩 Incoming saveMessage:", req.body);


      const listing = await Listing.findById(listingId);
      if (!listing) {
        return res.status(404).json({ error: "Listing not found" });
      }

      // Create notification in DB
      await createNotification(senderId, receiverId, listingId, listing.title);
      console.log("✅ Notification created for:", receiverId);

      // Send real-time notification via Socket.IO
      const io = req.app.get("io");
      if (io) {
        io.to(receiverId.toString()).emit("newNotification", {
          fromUser: senderId,
          listingId,
          propertyTitle: listing.title,
          content: text,
          sentAt: newMessage.sentAt,
        });
      }

      res.status(200).json(newMessage);
    } catch (error) {
      console.error("❌ Error in saveMessage:", error);
      res.status(500).json({ message: "Error saving message", error });
    }
  };



  // Send a new message
  export const sendMessage = async (req, res) => {
    try {
      const { receiverId, message, listingId } = req.body;
      const senderId = req.user._id; // 👈 Use senderId from the authenticated user
  
      if (!senderId || !receiverId || !message || !listingId) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const newMessage = await Message.create({
        senderId,
        receiverId,
        message,
        listingId,
        sentAt: new Date(),
        read: false,
      });

      const populatedMessage = await Message.findById(newMessage._id)
        .populate("senderId", "username photo")
        .populate("receiverId", "username photo")
        .populate("listingId", "title");

      // Send socket notification
      const io = req.app.get("io");
      if (io) {
        io.to(receiverId.toString()).emit("newNotification", {
          fromUser: populatedMessage.senderId,
          listingId,
          content: message,
          sentAt: populatedMessage.sentAt,
          senderPhoto: populatedMessage.senderId.photo,
        });
      }
      console.log("Sender (backend):", req.user.id); // or req.body.sender


      res.status(201).json(populatedMessage);
  } catch (error) {
    console.error("Send Message Error:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
};


  // Delete a message (if sender and within 5 minutes)
  export const deleteMessage = async (req, res) => {
    try {
      const messageId = req.params.messageId;
      const userId = req.user._id; // from verifyToken middleware
  
      const message = await Message.findById(messageId);
      if (!message) return res.status(404).json({ error: "Message not found" });
  
      if (message.senderId.toString() !== userId.toString()) {
        return res.status(403).json({ error: "Unauthorized to delete this message" });
      }
  
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      if (message.sentAt < fiveMinutesAgo) {
        return res.status(403).json({ error: "Can only delete within 5 minutes of sending" });
      }
  
      message.deleted = true;
      await message.save();
  
      // Real-time delete notification to the receiver
      const io = req.app.get("io");
      if (io) {
        io.to(message.receiverId.toString()).emit("deleteMessage", messageId); // Notify receiver
      }
  
      res.status(200).json({ message: "Message deleted successfully", messageId });
    } catch (err) {
      console.error("Delete Message Error:", err);
      res.status(500).json({ error: "Failed to delete message" });
    }
  };
  

  // Mark notifications as read
  export const markNotificationAsRead = async (req, res) => {
    try {
      const messageId = req.params.notifId;

      const message = await Message.findById(messageId);
      if (!message) return res.status(404).json({ error: "Notification not found" });

      message.read = true;
      await message.save();

      res.status(200).json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Failed to mark as read", err });
    }
  };

