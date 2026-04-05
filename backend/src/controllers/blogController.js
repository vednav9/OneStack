import {
    addToHistory,
    getAllBlogs,
    getBlogById,
    getEmbedStatusByBlogId,
    getBlogSummaryById,
    likeBlog,
    unlikeBlog,
    saveBlog,
    unsaveBlog,
} from "../services/blogService.js";
import { fetchFreshContent } from "../services/contentFetchService.js";

export async function getBlogs(req, res) {
    try {
        const blogs = await getAllBlogs();
        res.json(blogs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

export async function getBlog(req, res) {
    try {
        const blog = await getBlogById(req.params.id);
        if (!blog) return res.status(404).json({ error: "Blog not found" });
        res.json(blog);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

export async function saveBlogController(req, res) {
    try {
        const { id } = req.params;
        const result = await saveBlog(req.user.userId, id);
        res.json({ saved: true, ...result });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

export async function unsaveBlogController(req, res) {
    try {
        const { id } = req.params;
        await unsaveBlog(req.user.userId, id);
        res.json({ saved: false });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

export async function likeBlogController(req, res) {
    try {
        const { id } = req.params;
        const result = await likeBlog(req.user.userId, id);
        res.json({ liked: true, ...result });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

export async function unlikeBlogController(req, res) {
    try {
        const { id } = req.params;
        await unlikeBlog(req.user.userId, id);
        res.json({ liked: false });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

export async function readBlog(req, res) {
    try {
        const { id } = req.params;
        await addToHistory(req.user.userId, id);
        res.json({ message: "Recorded" });
    } catch (err) {
        // Don't fail the user experience for history tracking
        res.json({ message: "Recorded (with warning)" });
    }
}

export async function getBlogEmbedStatus(req, res) {
    try {
        const { id } = req.params;
        const status = await getEmbedStatusByBlogId(id);
        res.json(status);
    } catch (err) {
        res.status(500).json({
            embeddable: false,
            reason: "check_failed",
            error: err.message,
        });
    }
}

export async function getBlogSummary(req, res) {
    try {
        const { id } = req.params;
        const summary = await getBlogSummaryById(id);
        res.json(summary);
    } catch (err) {
        res.status(500).json({
            error: err.message || "Failed to generate summary",
        });
    }
}

export async function getBlogContent(req, res) {
    try {
        const { id } = req.params;
        const result = await fetchFreshContent(id);
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message || "Failed to fetch content" });
    }
}
