import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import {
    upvoteCommentController,
    removeUpvoteCommentController,
    downvoteCommentController,
    removeDownvoteCommentController,
} from "../controllers/commentController.js";

const router = express.Router();

router.post(":id/upvote", authMiddleware, upvoteCommentController);
router.delete(":id/upvote", authMiddleware, removeUpvoteCommentController);
router.post(":id/downvote", authMiddleware, downvoteCommentController);
router.delete(":id/downvote", authMiddleware, removeDownvoteCommentController);

export default router;
