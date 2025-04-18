import User from "../models/user.js";
import bcrypt from "bcryptjs";
import { errorhandler } from "../utils/error.js";
import jwt from "jsonwebtoken";

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


export const signin = async (req, res, next) => {
    try {
      const { email, password } = req.body;
  
      if (!email || !password) {
        return next(errorhandler(400, "Email and password are required."));
      }
  
      const existingUser = await User.findOne({ email });
      if (!existingUser) {
        return next(errorhandler(404, "User not found."));
      }
  
      const isPasswordCorrect = bcrypt.compareSync(password, existingUser.password);
      if (!isPasswordCorrect) {
        return next(errorhandler(401, "Invalid credentials!."));
      }
  
      const token = jwt.sign({ id: existingUser._id }, process.env.JWT_SECRET);

      res.cookie("access_token", token, {
        httpOnly: true,
      })
      .status(200).json({
        success: true,
        message: "Signed in successfully.",
        user: {
          id: existingUser._id,
          username: existingUser.username,
          email: existingUser.email,
        },
      });
  
    } catch (error) {
      next(error);
    }
  };