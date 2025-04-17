import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();



mongoose.connect(process.env.MONGO_URI).then(() => {
    console.log("MongoDB Connected Successfully!");
  }).catch((error) => {
    console.log("MongoDB Connection Error:", error.message);
  });

  const app = express();


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🔥 Server running at http://localhost:${PORT}`);
});
