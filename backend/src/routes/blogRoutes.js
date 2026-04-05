import express from "express";
import {
    getBlogs, getBlog,
    saveBlogController, unsaveBlogController,
    likeBlogController, unlikeBlogController,
    readBlog,
    getBlogEmbedStatus,
    getBlogSummary,
    getBlogContent,
} from "../controllers/blogController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", getBlogs);
router.get("/:id/embed-status", getBlogEmbedStatus);
router.get("/:id/summary", getBlogSummary);
router.get("/:id/content", getBlogContent);
router.get("/:id", getBlog);
router.post("/:id/save", authMiddleware, saveBlogController);
router.delete("/:id/save", authMiddleware, unsaveBlogController);
router.post("/:id/like", authMiddleware, likeBlogController);
router.delete("/:id/like", authMiddleware, unlikeBlogController);
router.post("/:id/read", authMiddleware, readBlog);

export default router;
