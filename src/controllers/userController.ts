import { Request, Response } from "express";
import User from "../models/userModel";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cloudinary from "cloudinary";
import fs from "fs";

interface CustomRequest extends Request {
  userId?: string;
  file?: Express.Multer.File;
}

// Configure cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export const registerUser = async (req: CustomRequest, res: Response): Promise<void> => {
  try {
    const { name, email, address, password, bio } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({
        success: false,
        message: "User with this email already exists"
      });
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let profileImageUrl = "";

    // Handle profile image upload if exists
    if (req.file) {
      const result = await cloudinary.v2.uploader.upload(req.file.path, {
        folder: "user_profiles",
        width: 500,
        crop: "scale"
      });
      profileImageUrl = result.secure_url;

      // Remove temporary file
      fs.unlinkSync(req.file.path);
    }

    // Create new user
    const newUser = await User.create({
      name,
      email,
      address,
      password: hashedPassword,
      bio: bio || "",
      profileImage: profileImageUrl
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser._id },
      process.env.JWT_SECRET as string ||"z8dF@K!#29PcWt$3YjRkL0#Xa^zQmBn&Vr5T%Hd6Gq*oLpNx",
      { expiresIn: "30d" }
    );

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        address: newUser.address,
        bio: newUser.bio,
        profileImage: newUser.profileImage
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to register user",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      res.status(400).json({
        success: false,
        message: "Invalid credentials"
      });
      return;
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(400).json({
        success: false,
        message: "Invalid credentials"
      });
      return;
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET as string||"z8dF@K!#29PcWt$3YjRkL0#Xa^zQmBn&Vr5T%Hd6Gq*oLpNx",
      { expiresIn: "30d" }
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        address: user.address,
        bio: user.bio,
        profileImage: user.profileImage
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to login",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

export const getUserProfile = async (req: CustomRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;

    // Fetch user profile
    const user = await User.findById(userId).select("-password");
    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found"
      });
      return;
    }

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch user profile",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

export const updateUserProfile = async (req: CustomRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const { name, address, bio } = req.body;

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found"
      });
      return;
    }

    // Update user data
    if (name) user.name = name;
    if (address) user.address = address;
    if (bio !== undefined) user.bio = bio;

    // Handle profile image update if exists
    if (req.file) {
      // Delete previous image from cloudinary if exists
      if (user.profileImage && user.profileImage.includes('cloudinary')) {
        const publicId = user.profileImage.split('/').pop()?.split('.')[0];
        if (publicId) {
          await cloudinary.v2.uploader.destroy(`user_profiles/${publicId}`);
        }
      }

      // Upload new image
      const result = await cloudinary.v2.uploader.upload(req.file.path, {
        folder: "user_profiles",
        width: 500,
        crop: "scale"
      });
      user.profileImage = result.secure_url;

      // Remove temporary file
      fs.unlinkSync(req.file.path);
    }

    // Save updated user
    await user.save();

    res.status(200).json({
      success: true,
      message: "User profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        address: user.address,
        bio: user.bio,
        profileImage: user.profileImage
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update user profile",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

export const deleteUserAccount = async (req: CustomRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;

    // Find and delete user
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found"
      });
      return;
    }

    // Delete profile image from cloudinary if exists
    if (user.profileImage && user.profileImage.includes('cloudinary')) {
      const publicId = user.profileImage.split('/').pop()?.split('.')[0];
      if (publicId) {
        await cloudinary.v2.uploader.destroy(`user_profiles/${publicId}`);
      }
    }

    res.status(200).json({
      success: true,
      message: "User account deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete user account",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
};