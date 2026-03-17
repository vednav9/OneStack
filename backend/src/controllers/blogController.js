import { getAllBlogs, getBlogById } from "../services/blogService.js";

export async function getBlogs(req, res) {
    const blogs = await getAllBlogs();

    res.json(blogs);
}

export async function getBlog(req, res) {
    const blog = await getBlogById(req.params.id);

    res.json(blog);
}
