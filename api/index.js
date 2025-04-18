import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import userRouter from './routes/user.route.js';
import authRouter from './routes/auth.route.js';

dotenv.config();



mongoose.connect(process.env.MONGO_URI).then(() => {
    console.log("MongoDB Connected Successfully!");
  }).catch((error) => {
    console.log("MongoDB Connection Error:", error.message);
  });

  const app = express();

app.use(express.json());

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🔥 Server running at http://localhost:${PORT}`);
});

app.use('/api/user', userRouter);
app.use('/api/auth', authRouter);