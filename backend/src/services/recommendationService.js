import prisma from "../config/db.js";
import { normalizeBlogTags } from "./blogService.js";
import { getTrendingBlogs } from "./trendingService.js";

const blogInclude = {
    tag: { include: { tag: true } },
    _count: {
        select: {
            likedBy: true,
            history: true,
        },
    },
};

export async function getUserPreferences(userId) {
    const likes = await prisma.likedBlog.findMany({
        where: { userId },
        include: { blog: { include: { tag: { include: { tag: true } } } } },
    });
    const saved = await prisma.savedBlog.findMany({
        where: { userId },
        include: { blog: { include: { tag: { include: { tag: true } } } } },
    });
    const history = await prisma.readingHistory.findMany({
        where: { userId },
        include: { blog: { include: { tag: { include: { tag: true } } } } },
    });

    // Extract tag preferences
    const tagCount = {};

    [...likes, ...saved, ...history].forEach((item) => {
        item.blog.tag.forEach((t) => {
            const tagName = t.tag.name;
            tagCount[tagName] = (tagCount[tagName] || 0) + 1;
        });
    });
    return tagCount;
}

export async function getRecommendedBlogs(userId) {
    const preferences = await getUserPreferences(userId);

    const topTags = Object.keys(preferences)
        .sort((a, b) => preferences[b] - preferences[a])
        .slice(0, 5);

    if (topTags.length === 0) {
        const blogs = await prisma.blog.findMany({
            take: 10,
            orderBy: { createdAt: "desc" },
            include: blogInclude,
        });
        return blogs.map(normalizeBlogTags);
    }

    const blogs = await prisma.blog.findMany({
        where: {
            tag: {
                some: {
                    tag: {
                        name: { in: topTags },
                    },
                },
            },
        },
        take: 20,
        include: blogInclude,
    });
    return blogs.map(normalizeBlogTags);
}

export async function getPersonalizedFeed(userId) {
    const recommended = await getRecommendedBlogs(userId);
    const trending = (await getTrendingBlogs()).slice(0, 5);

    const combined = [...recommended, ...trending];
    const seen = new Set();
    const deduped = combined.filter((blog) => {
        const key = blog?.id ?? blog?.sourceURL ?? JSON.stringify(blog);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });

    return deduped.sort(() => Math.random() - 0.5);
}
