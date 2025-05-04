import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import userRouter from './routes/user.route.js';
import authRouter from './routes/auth.route.js';
import listingRouter from './routes/listing.route.js';
import chatRoutes from './routes/chat.route.js';
import cors from 'cors';
import http from 'http'; 
import { Server } from 'socket.io'; 
import Message from './models/Message.js'; 

dotenv.config();

// Connect MongoDB
mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log("✅ MongoDB Connected Successfully!");
}).catch((error) => {
  console.log("❌ MongoDB Connection Error:", error.message);
});

const app = express();

// Middlewares
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// Routes
app.use('/api/user', userRouter);
app.use('/api/auth', authRouter);
app.use('/api/listings', listingRouter);
app.use('/uploads', express.static('uploads'));
app.use('/api/chat', chatRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });

  console.error("Error:", err.stack);
});

// Create HTTP server and bind Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

// ✅ Socket.IO logic
io.on('connection', (socket) => {
  console.log('🔌 A user connected: ', socket.id);

  socket.on("join", (userId) => {
    socket.join(userId);
  });
  

  socket.on("sendMessage", async ({ content, fromUser, toUser, listingId }) => {
    const newMsg = new Message({ content, fromUser, toUser, listingId });
    await newMsg.save();
  
    io.to(toUser).emit("newNotification", {
      fromUser,
      listingId,
      content,
      sentAt: new Date(),
      senderPhoto: fromUser.photo, // assuming sender's photo is available
    });
  });
  

  socket.on('disconnect', () => {
    console.log('❌ A user disconnected:', socket.id);
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🔥 Server running at http://localhost:${PORT}`);
});
