import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import userRouter from './routes/user.route.js';
import authRouter from './routes/auth.route.js';
import listingRouter from './routes/listing.route.js'
import path from "path";

dotenv.config();



mongoose.connect(process.env.MONGO_URI).then(() => {
    console.log("MongoDB Connected Successfully!");
  }).catch((error) => {
    console.log("MongoDB Connection Error:", error.message);
  });

  const app = express();

app.use(express.json());


app.use('/api/user', userRouter);
app.use('/api/auth', authRouter);
app.use('/api/listing',listingRouter);
app.use('/uploads', express.static('uploads'));


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

const PORT = process.env.PORT || 3000;


app.listen(PORT, () => {
  console.log(`🔥 Server running at http://localhost:${PORT}`);
});