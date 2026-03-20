import express from "express";
import { getBlogs, getBlog, saveBlogController, likeBlogController, readBlog } from "../controllers/blogController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", getBlogs);
router.get("/:id", getBlog);
router.post("/:id/save", authMiddleware, saveBlogController);
router.post("/:id/like", authMiddleware, likeBlogController);
router.post("/:id/read", authMiddleware, readBlog);

export default router;
