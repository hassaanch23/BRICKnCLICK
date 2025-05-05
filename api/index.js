import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import userRouter from './routes/user.route.js';
import authRouter from './routes/auth.route.js';
import listingRouter from './routes/listing.route.js';
import chatRoutes from './routes/chat.route.js';
import cors from 'cors';
import http from 'http'; // for creating the HTTP server
import { Server }from 'socket.io'; // for using Socket.IO
import notificationRoutes from './routes/notifications.route.js';

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
app.use('/api/notifications', notificationRoutes);

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

// Create server and Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

export { io };

// Attach io to app for access in controllers
app.set("io", io);

// Socket.IO logic
const users = {}; // Store users and their respective socket IDs

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("addUser", (userId) => {
    console.log(`✅ Received userId from frontend: ${userId}`);
    userSocketMap[userId] = socket.id;
    console.log("Updated userSocketMap:", userSocketMap);
  });
  

  socket.on("sendMessage", (message) => {
    const receiverSocketId = users[message.receiverId];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("getMessage", message);
    }
  });

  socket.on("deleteMessage", (message) => {
    const receiverSocketId = users[message.receiverId];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("deleteMessage", message.msgId);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});



// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🔥 Server running at http://localhost:${PORT}`);
});
