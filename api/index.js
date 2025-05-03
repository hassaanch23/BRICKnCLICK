import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import userRouter from './routes/user.route.js';
import authRouter from './routes/auth.route.js';
import listingRouter from './routes/listing.route.js';
import chatRoutes from './routes/chat.route.js';
import cors from 'cors';
import http from 'http'; // ✅ Added for socket.io
import { Server } from 'socket.io'; // ✅ Added for socket.io

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
const server = http.createServer(app); // ✅ Wrap Express in HTTP server

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

// ✅ Socket.IO logic
io.on('connection', (socket) => {
  console.log('🔌 A user connected: ', socket.id);

  socket.on('joinChat', (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room ${roomId}`);
  });

  socket.on('sendMessage', (data) => {
    const { roomId, message } = data;
    io.to(roomId).emit('receiveMessage', message);
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
