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
    deleteBlog,
} from "../controllers/blogController.js";
import { getBlogComments, createBlogComment } from "../controllers/commentController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import optionalAuth from "../middlewares/optionalAuth.js";
import adminOnly from "../middlewares/adminOnly.js";
import forbidAdmin from "../middlewares/forbidAdmin.js";

const router = express.Router();

router.get("/", getBlogs);
router.get("/:id/embed-status", getBlogEmbedStatus);
router.get("/:id/summary", getBlogSummary);
router.get("/:id/content", getBlogContent);
router.get("/:id/comments", optionalAuth, getBlogComments);
router.get("/:id", getBlog);
router.post("/:id/comments", authMiddleware, createBlogComment);
router.post("/:id/save", authMiddleware, saveBlogController);
router.delete("/:id/save", authMiddleware, unsaveBlogController);
router.post("/:id/upvote", authMiddleware, forbidAdmin, upvoteBlogController);
router.delete("/:id/upvote", authMiddleware, forbidAdmin, removeUpvoteBlogController);
router.post("/:id/downvote", authMiddleware, forbidAdmin, downvoteBlogController);
router.delete("/:id/downvote", authMiddleware, forbidAdmin, removeDownvoteBlogController);
router.post("/:id/read", authMiddleware, readBlog);
router.delete("/:id", authMiddleware, adminOnly, deleteBlog);

export default router;
