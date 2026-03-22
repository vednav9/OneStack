import {
    getRecommendedBlogs,
    getPersonalizedFeed,
} from "../services/recommendationService.js";

import { getTrendingBlogs } from "../services/trendingService.js";

export async function recommended(req, res) {
    const blogs = await getRecommendedBlogs(req.user.userId);
    res.json(blog);
}

export async function feed(req, res) {
    const blogs = await getPersonalizedFeed(req.user.userId);
    res.json(blogs);
}

export async function trending(req, res) {
    const blogs = await getTrendingBlogs();
    res.json(blogs);
}
