import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";

import {
  recommended,
  feed,
  trending
} from "../controllers/recommendationController.js";

const router = express.Router();

router.get("/recommended", authMiddleware, recommended);
router.get("/feed", authMiddleware, feed);
router.get("/trending", trending);

export default router;