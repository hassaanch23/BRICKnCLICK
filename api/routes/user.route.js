import express from "express";
import { test, updateProfile } from "../controllers/user.controller.js";
import { verifyToken } from "../middleware/auth.js";  // Authentication middleware
import upload from "../middleware/upload.js";  // File upload middleware
import { deleteUser } from "../controllers/user.controller.js";  // Import the deleteUser function

const router = express.Router();

// Test route (you can remove this or keep it for testing purposes)
router.get("/test", test);

router.put("/update", verifyToken, upload.single('avatar'), updateProfile);
router.delete("/delete", verifyToken, deleteUser);

export default router;
