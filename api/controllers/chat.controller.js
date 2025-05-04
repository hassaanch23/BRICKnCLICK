import Message from "../models/Message.js";
import { Server } from "socket.io";

// Get messages between two users
export const getMessages = async (req, res) => {
  try {
    const { userId1, userId2 } = req.params;

    const messages = await Message.find({
      $or: [
        { senderId: userId1, receiverId: userId2 },
        { senderId: userId2, receiverId: userId1 },
      ],
      deleted: { $ne: true },
    }).sort({ createdAt: 1 })
    .populate('senderId', 'username photo')
      .populate('receiverId', 'username photo')
      .populate('listingId', 'title');

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: "Error fetching messages", error });
  }
};

// Save a new message (this can be used if you want to store a message in a specific way)
export const saveMessage = async (req, res) => {
  const { senderId, receiverId, text } = req.body;

  try {
    const newMessage = new Message({
      senderId,
      receiverId,
      message: text,
    });

    await newMessage.save();

    res.status(200).json(newMessage);
  } catch (error) {
    res.status(500).json({ message: "Error saving message", error });
  }
};


// Send a new message
export const sendMessage = async (req, res) => {
  try {
    const { senderId, receiverId, message,listingId } = req.body;

    const newMessage = await Message.create({
      senderId,
      receiverId,
      message,
      sentAt: new Date(),
    });

    await newMessage.save();

    const populatedMessage = await newMessage.populate("senderId", "username photo");

    // Emit notification to receiver via Socket.IO
    const io = req.app.get("io"); // from express socket.io setup
    io.to(receiverId.toString()).emit("newNotification", {
      fromUser: populatedMessage.senderId.username,
      listingId,
      content: message,
      sentAt: populatedMessage.sentAt,
      senderPhoto: populatedMessage.senderId.photo,
    });

    res.status(201).json(populatedMessage);
  } catch (error) {
    res.status(500).json({ error: "Failed to send message" });
  }
};

// Delete a message (if sender and within 5 minutes)
export const deleteMessage = async (req, res) => {
  try {
    const messageId = req.params.messageId;
    const userId = req.user.id;

    const message = await Message.findById(messageId);

    if (!message) return res.status(404).json({ error: "Message not found" });
    if (message.senderId.toString() !== userId)
      return res.status(403).json({ error: "Unauthorized to delete this message" });

    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    if (message.createdAt < fiveMinutesAgo)
      return res.status(403).json({ error: "Can only delete within 5 minutes" });

    message.deleted = true;
    await message.save();

    res.status(200).json({ message: "Message deleted successfully" });
  } catch (err) {
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

