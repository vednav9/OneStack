import prisma from "../config/db.js";

export function normalizeBlogTags(blog) {
    const tags = blog.tag?.map((entry) => entry.tag.name) || [];
    const likeCount = blog._count?.likedBy ?? blog.likesCount ?? 0;
    const readCount = blog._count?.history ?? 0;
    const { _count, tag, ...rest } = blog;
    return {
        ...rest,
        tags,
        likes: likeCount,
        reads: readCount,
    };
}

export async function getAllBlogs() {
    const blogs = await prisma.blog.findMany({
        include: {
            tag: { include: { tag: true } },
            _count: { select: { likedBy: true, history: true } },
        },
        orderBy: { createdAt: "desc" },
    });

    return blogs.map(normalizeBlogTags);
}

export async function getBlogById(id) {
    const blog = await prisma.blog.findUnique({
        where: { id },
        include: {
            tag: { include: { tag: true } },
            _count: { select: { likedBy: true, history: true } },
        },
    });

    if (!blog) return null;
    return normalizeBlogTags(blog);
}

export async function saveBlog(userId, blogId) {
    return prisma.savedBlog.upsert({
        where: { userId_blogId: { userId, blogId } },
        update: {},
        create: { userId, blogId },
    });
}

export async function unsaveBlog(userId, blogId) {
    return prisma.savedBlog.deleteMany({
        where: { userId, blogId },
    });
}

export async function likeBlog(userId, blogId) {
    return prisma.likedBlog.upsert({
        where: { userId_blogId: { userId, blogId } },
        update: {},
        create: { userId, blogId },
    });
}

export async function unlikeBlog(userId, blogId) {
    return prisma.likedBlog.deleteMany({
        where: { userId, blogId },
    });
}

export async function addToHistory(userId, blogId) {
    return prisma.readingHistory.create({
        data: { userId, blogId },
    });
}

export async function createList(userId, name) {
    return prisma.list.create({
        data: { name, userId },
    });
}

export async function addToList(listId, blogId) {
    return prisma.listBlog.create({
        data: { listId, blogId },
    });
}
