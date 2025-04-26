import multer from "multer";
import path from "path";
import fs from "fs";
import User from "../models/user.js"; // Adjust if needed

// Multer storage config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = "uploads/";
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir); // Create 'uploads' directory if it doesn't exist
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname); // Get the file extension
    cb(null, `avatar-${Date.now()}${ext}`); // File name based on current timestamp
  },
});

export const upload = multer({ storage }).single("avatar");

import bcryptjs from "bcryptjs"; // Import bcryptjs for hashing passwords

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { username, password } = req.body; // Extract username and password
    let avatarUrl;

    // Check if avatar is uploaded
    if (req.file) {
      avatarUrl = `/uploads/${req.file.filename}`; // Set avatar URL
    }

    // Prepare the update object
    const updateData = {
      ...(username && { username }), // Only update username if provided
      ...(avatarUrl && { avatar: avatarUrl }), // Only update avatar if a new one is uploaded
    };

    // If a new password is provided, hash it and add it to the update data
    if (password) {
      const salt = await bcryptjs.genSalt(10); // Generate salt
      const hashedPassword = await bcryptjs.hash(password, salt); // Hash password
      updateData.password = hashedPassword; // Add hashed password to update data
    }

    // Update user profile in the database
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    ).select("-password"); // Exclude the password field from the response

    // Send the updated user data as a response
    res.status(200).json(updatedUser);
  } catch (err) {
    console.error("Update Profile Error:", err);
    res.status(500).json({ message: "Profile update failed" });
  }
};


// Optional test route for testing purposes
export const test = (req, res) => {
  res.json({ message: "User test route" });
};

export const deleteUser = async (req, res) => {

  console.log("Inside deleteUser controller");
  console.log("User ID:", req.user.id);

  try {
    const userId = req.user.id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }


    if (user.avatar) {
      const avatarPath = path.join("public", user.avatar);
      if (fs.existsSync(avatarPath)) {
        fs.unlinkSync(avatarPath);
      }
    }

    await User.findByIdAndDelete(userId);
    res.clearCookie("access_token");
    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Delete User Error:", err);
    res.status(500).json({ message: "User deletion failed" });
  }
};
