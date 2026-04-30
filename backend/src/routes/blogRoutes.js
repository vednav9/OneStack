import express from "express";
import {
    getBlogs, getBlog,
    saveBlogController, unsaveBlogController,
    upvoteBlogController, removeUpvoteBlogController,
    downvoteBlogController, removeDownvoteBlogController,
    readBlog,
    getBlogEmbedStatus,
    getBlogSummary,
    getBlogContent,
} from "../controllers/blogController.js";
import { getBlogComments, createBlogComment } from "../controllers/commentController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import optionalAuth from "../middlewares/optionalAuth.js";

const router = express.Router();

router.get("/", getBlogs);
router.get("/:id/embed-status", getBlogEmbedStatus);
router.get("/:id/summary", getBlogSummary);
router.get("/:id/content", getBlogContent);
router.get(":id/comments", optionalAuth, getBlogComments);
router.get("/:id", getBlog);
router.post(":id/comments", authMiddleware, createBlogComment);
router.post("/:id/save", authMiddleware, saveBlogController);
router.delete("/:id/save", authMiddleware, unsaveBlogController);
router.post(":id/upvote", authMiddleware, upvoteBlogController);
router.delete(":id/upvote", authMiddleware, removeUpvoteBlogController);
router.post(":id/downvote", authMiddleware, downvoteBlogController);
router.delete(":id/downvote", authMiddleware, removeDownvoteBlogController);
router.post("/:id/read", authMiddleware, readBlog);

export default router;
