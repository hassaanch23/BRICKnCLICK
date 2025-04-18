import User from "../models/user.js";
import bcrypt from "bcryptjs";
import { errorhandler } from "../utils/error.js";

export const signup = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return next(errorhandler(400, "All fields are required."));
    }
    
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return next(errorhandler(409, "Username is already taken."));
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return next(errorhandler(409, "User with this email already exists."));
    }

    

    const hashPassword = bcrypt.hashSync(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashPassword,
    });

    await newUser.save();

    res.status(201).json({ success: true, message: "User has been created." });

  } catch (error) {
    next(error);
  }
};
