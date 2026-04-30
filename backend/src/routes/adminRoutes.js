import express from "express";
import { adminLogin, verifyAdmin } from "../controllers/adminController.js";
import adminAuthMiddleware from "../middlewares/adminAuthMiddleware.js";

const router = express.Router();

router.post("/login", adminLogin);
router.get("/verify", adminAuthMiddleware, verifyAdmin);

export default router;
