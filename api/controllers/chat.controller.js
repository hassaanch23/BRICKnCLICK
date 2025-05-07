  import Message from "../models/Message.js";
  import { Server } from "socket.io";
  import { createNotification } from "./notifications.controller.js";
  import Listing from "../models/listing.model.js";

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
      .populate('senderId', 'username avatar')
        .populate('receiverId', 'username avatar')
        .populate('listingId', 'name')
        .sort({ sentAt: 1 });

      res.status(200).json(messages);
    } catch (error) {
      res.status(500).json({ message: "Error fetching messages", error });
    }
  };

  export const sendMessage = async (req, res) => {
    try {
      console.log("Request body:", req.body);
      console.log("Authenticated user ID:", req.user.id); // Log the authenticated user ID
      const { receiverId, message, listingId } = req.body;
      const senderId = req.user.id; // Authenticated user
      const io = req.app.get("io");
  
      if (!senderId || !receiverId || !message || !listingId) {
        return res.status(400).json({ error: "Missing required fields" });
      }
  
      // Save the message
      const newMessage = await Message.create({
        senderId,
        receiverId,
        message,
        listingId,
        sentAt: new Date(),
        read: false,
      });

      console.log("New Message Created:", newMessage);
  
     
      const populatedMessage = await Message.findById(newMessage._id)
        .populate("senderId", "username avatar")
        .populate("receiverId", "username avatar")
        .populate("listingId", "name");
  
      // Find listing to use title in notification
      const listing = await Listing.findById(listingId);
      if (!listing) {
        return res.status(404).json({ error: "Listing not found" });
      }
  
      // Save notification in DB
      await createNotification(senderId, receiverId, listingId,listing.name);
  
      // Emit real-time notification
      if (io) {
        io.to(receiverId.toString()).emit("newNotification", {
          fromUser: populatedMessage.senderId,
          listingId,
          propertyTitle: listing.title,
          content: message,
          sentAt: populatedMessage.sentAt,
          senderPhoto: populatedMessage.senderId.photo,
        });
      }
  
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

