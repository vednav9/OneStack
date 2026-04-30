import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import forbidAdmin from "../middlewares/forbidAdmin.js";
import {
    upvoteCommentController,
    removeUpvoteCommentController,
    downvoteCommentController,
    removeDownvoteCommentController,
} from "../controllers/commentController.js";

const router = express.Router();

router.post("/:id/upvote", authMiddleware, forbidAdmin, upvoteCommentController);
router.delete("/:id/upvote", authMiddleware, forbidAdmin, removeUpvoteCommentController);
router.post("/:id/downvote", authMiddleware, forbidAdmin, downvoteCommentController);
router.delete("/:id/downvote", authMiddleware, forbidAdmin, removeDownvoteCommentController);

export default router;
