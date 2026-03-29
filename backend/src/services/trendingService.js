import prisma from "../config/db.js";
import { normalizeBlogTags } from "./blogService.js";

export async function getTrendingBlogs() {
    const blogs = await prisma.blog.findMany({
        take: 10,
        orderBy: [
            { likedBy: { _count: "desc" } },
            { history: { _count: "desc" } },
            { createdAt: "desc" },
        ],
        include: {
            tag: { include: { tag: true } },
            _count: {
                select: {
                    likedBy: true,
                    history: true,
                },
            },
        },
    });
    return blogs.map(normalizeBlogTags);
}
