import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import { uploadAvatar } from "../middlewares/upload.js";
import {
	getProfile,
	updateProfile,
	getUserHistory,
	getUserSaved,
	getUserUpvotes,
	getUserDownvotes,
	deleteProfile,
	uploadProfilePhoto,
} from "../controllers/userController.js";

const router = express.Router();

router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, updateProfile);
router.get("/history", authMiddleware, getUserHistory);
router.get("/saved", authMiddleware, getUserSaved);
router.get("/upvotes", authMiddleware, getUserUpvotes);
router.get("/downvotes", authMiddleware, getUserDownvotes);
router.delete("/profile", authMiddleware, deleteProfile);
router.post("/profile/photo", authMiddleware, uploadAvatar.single("photo"), uploadProfilePhoto);

export default router;
