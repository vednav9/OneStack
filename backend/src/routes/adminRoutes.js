import express from "express";
import { adminLogin, verifyAdmin, getAdminDashboard } from "../controllers/adminController.js";
import adminAuthMiddleware from "../middlewares/adminAuthMiddleware.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import adminOnly from "../middlewares/adminOnly.js";

const router = express.Router();

router.post("/login", adminLogin);
router.get("/verify", adminAuthMiddleware, verifyAdmin);
router.get("/dashboard", authMiddleware, adminOnly, getAdminDashboard);

export default router;
