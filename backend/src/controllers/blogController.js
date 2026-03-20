import {
    addToHistory,
    getAllBlogs,
    getBlogById,
    likeBlog,
    saveBlog,
} from "../services/blogService.js";

export async function getBlogs(req, res) {
    const blogs = await getAllBlogs();

    res.json(blogs);
}

export async function getBlog(req, res) {
    const blog = await getBlogById(req.params.id);

    res.json(blog);
}

export async function saveBlogController(req, res) {
    const { id } = req.params;

    const result = await saveBlog(req.user.userId, id);

    res.json(result);
}

export async function likeBlogController(req, res) {
    const { id } = req.params;

    const result = await likeBlog(req.user.userId, id);

    res.json(result);
}

export async function readBlog(req, res) {
    const { id } = req.params;

    await addToHistory(req.user.userId, id);

    res.json({ message: "Recorded" });
}
