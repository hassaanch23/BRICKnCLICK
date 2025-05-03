import Message from "../models/Message.js";

// Get messages between two users
export const getMessages = async (req, res) => {
  try {
    const { userId1, userId2 } = req.params;

    const messages = await Message.find({
      $or: [
        { senderId: userId1, receiverId: userId2 },
        { senderId: userId2, receiverId: userId1 },
      ],
    }).sort({ createdAt: 1 })
    .populate('senderId', 'username photo');

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
    const { senderId, receiverId, message } = req.body;

    const newMessage = await Message.create({
      senderId,
      receiverId,
      message,
    });

    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ message: "Error sending message", error });
  }
};

// Delete a message (if sender and within 5 minutes)
export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Check if the current user is the sender
    if (message.senderId.toString() !== userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Check if message is within 5 minutes
    const now = new Date();
    const sentTime = new Date(message.sentAt);
    const timeDiff = (now - sentTime) / 60000;

    if (timeDiff > 5) {
      return res.status(400).json({ message: "Time limit exceeded" });
    }

    // Mark as deleted (or you can actually delete if you want)
    message.deleted = true;
    message.message = "[Message deleted]";
    await message.save();

    res.status(200).json({ message: "Message deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting message", error });
  }
};
