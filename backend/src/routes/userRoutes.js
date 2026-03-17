import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import { getProfiles, updateProfiles } from "../controllers/userController.js";

const router = express.Router();

router.get("/profile", authMiddleware, getProfiles);
router.put("/profile", authMiddleware, updateProfiles);

export default router;
