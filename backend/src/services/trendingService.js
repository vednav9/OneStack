import prisma from "../config/db.js";
import { normalizeBlogTags } from "./blogService.js";

export async function getTrendingBlogs() {
    const blogs = await prisma.blog.findMany({
        take: 50,
        orderBy: [{ createdAt: "desc" }],
        include: {
            tag: { include: { tag: true } },
            _count: {
                select: {
                    upvotes: true,
                    downvotes: true,
                    history: true,
                },
            },
        },
    });

    const normalized = blogs.map(normalizeBlogTags);
    const sorted = normalized.sort((a, b) => {
        if ((b.score ?? 0) !== (a.score ?? 0)) return (b.score ?? 0) - (a.score ?? 0);
        if ((b.upvotes ?? 0) !== (a.upvotes ?? 0)) return (b.upvotes ?? 0) - (a.upvotes ?? 0);
        if ((b.reads ?? 0) !== (a.reads ?? 0)) return (b.reads ?? 0) - (a.reads ?? 0);
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });

    return sorted.slice(0, 10);
}
