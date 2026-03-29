import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import { getProfile, updateProfile, getUserHistory, getUserSaved } from "../controllers/userController.js";

const router = express.Router();

router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, updateProfile);
router.get("/history", authMiddleware, getUserHistory);
router.get("/saved", authMiddleware, getUserSaved);

export default router;
