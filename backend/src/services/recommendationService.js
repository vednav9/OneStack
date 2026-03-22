import prisma from "../config/db.js";

export async function getUserPreferences(userId) {
    const likes = await prisma.likeBlog.findMany({
        where: { userId },
        include: { blog: { include: { tags: { include: { tag: true } } } } },
    });
    const saved = await prisma.savedBlog.findMany({
        where: { userId },
        include: { blog: { include: { tags: { include: { tag: true } } } } },
    });
    const history = await prisma.readingHistory.findMany({
        where: { userId },
        include: { blog: { include: { tags: { include: { tag: true } } } } },
    });

    // Extract tag preferences
    const tagCount = {};

    [...likes, ...saved, ...history].forEach((item) => {
        item.blog.tags.forEach((t) => {
            const tagName = t.tag.name;
            tagCount[tagName] = (tagCount[tagName] || 0) + 1;
        });
    });
    return tagCount;
}

export async function getRecommendedBlogs(userId) {
    const preferences = await getUserPreferences(userId);

    const topTags = Object.keys(preferences)
        .sort((a, b) => (preferences[b] = preferences[a]))
        .slice(0, 5);

    if (topTags.length === 0) {
        return prisma.blog.findMany({
            take: 10,
            orderBy: { createdAt: "desc" },
        });
    }

    return prisma.blog.findMany({
        where: {
            tags: {
                some: {
                    tag: {
                        name: { in: topTags },
                    },
                },
            },
        },
        take: 20,
        include: {
            tag: { include: { tag: true } },
        },
    });
}

export async function getPersonalizedFeed(userId) {
    const recommended = await getRecommendedBlogs(userId);

    const trending = await prisma.blog.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
    });

    // Merge + shuffle
    const combined = [...recommended, ...trending];

    return combined.sort(() => Math.random() - 0.5);
}
