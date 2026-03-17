import { searchBlogs } from "../services/searchService.js";

export async function search(req, res) {
    const { q } = req.query;

    const results = await searchBlogs(q);

    res.json(results);
}
