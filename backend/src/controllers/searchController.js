import { searchBlogs } from "../services/searchService.js";

export async function search(req, res, next) {
    const { q } = req.query;
    if (!q || !String(q).trim()) {
        return res.json([]);
    }

    try {
        const results = await searchBlogs(q);
        return res.json(results);
    } catch (err) {
        return next(err);
    }
}
