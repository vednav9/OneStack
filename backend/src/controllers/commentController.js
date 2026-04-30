import {
    getCommentsByBlogId,
    createComment,
    upvoteComment,
    removeUpvoteComment,
    downvoteComment,
    removeDownvoteComment,
} from "../services/commentService.js";

const MAX_COMMENT_LENGTH = 2000;

export async function getBlogComments(req, res) {
    try {
        const { id } = req.params;
        const userId = req.user?.userId || null;
        const comments = await getCommentsByBlogId(id, userId);
        res.json(comments);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

export async function createBlogComment(req, res) {
    try {
        const { id } = req.params;
        const content = String(req.body?.content || "").trim();
        if (!content) return res.status(400).json({ error: "Comment content is required" });
        if (content.length > MAX_COMMENT_LENGTH) {
            return res.status(400).json({ error: "Comment is too long" });
        }

        const comment = await createComment(req.user.userId, id, content);
        res.status(201).json(comment);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

export async function upvoteCommentController(req, res) {
    try {
        const { id } = req.params;
        const result = await upvoteComment(req.user.userId, id);
        res.json({ upvoted: true, ...result });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

export async function removeUpvoteCommentController(req, res) {
    try {
        const { id } = req.params;
        await removeUpvoteComment(req.user.userId, id);
        res.json({ upvoted: false });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

export async function downvoteCommentController(req, res) {
    try {
        const { id } = req.params;
        const result = await downvoteComment(req.user.userId, id);
        res.json({ downvoted: true, ...result });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

export async function removeDownvoteCommentController(req, res) {
    try {
        const { id } = req.params;
        await removeDownvoteComment(req.user.userId, id);
        res.json({ downvoted: false });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
