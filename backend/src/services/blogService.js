import prisma from "../config/db.js";

export async function getAllBlogs() {
    return prisma.blog.findMany({
        include: {
            tags: { include: { tag: true } },
        },
        orderBy: { createdAt: "desc" },
    });
}

export async function getBlogById(id) {
    return prisma.blog.findUnique({
        where: { id },
        include: {
            tags: { include: { tag: true } },
        },
    });
}

export async function saveBlog(userId, blogId) {
    return prisma.savedBlog.create({
        data: { userId, blogId },
    });
}

export async function likeBlog(userId, blogId) {
    return prisma.likedBlog.create({
        data: { userId, blogId },
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
