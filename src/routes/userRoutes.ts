import express from "express";
import {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  deleteUserAccount
} from "../controllers/userController";
import verifyToken from "../middleware/verifyToken";
import upload from "../middleware/multerMiddleware";

const router = express.Router();

// Public routes
router.post("/register", upload.single("profileImage"), registerUser);
router.post("/login", loginUser);

// Protected routes
router.get("/profile", verifyToken, getUserProfile);
router.patch("/profile", verifyToken, upload.single("profileImage"), updateUserProfile);
router.delete("/account", verifyToken, deleteUserAccount);

export default router;