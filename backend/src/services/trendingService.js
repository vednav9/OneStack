import prisma from "../config/db.js";

export async function getTrendingBlogs() {
    return prisma.blog.findMany({
        take: 10,
        orderBy: [
            { likedBy: { _count: "desc" } },
            { history: { _count: "desc" } },
            { createdAt: "desc" },
        ],
        include: {
            _count: {
                select: {
                    likedBy: true,
                    history: true,
                },
            },
        },
    });
}
