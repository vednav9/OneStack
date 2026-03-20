import prisma from "../config/db.js";

function normalizeBlogTags(blog) {
    const tags = blog.tag?.map((entry) => entry.tag.name) || [];
    return {
        ...blog,
        tags,
    };
}

export async function getAllBlogs() {
    const blogs = await prisma.blog.findMany({
        include: {
            tag: { include: { tag: true } },
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
        },
    });

    if (!blog) return null;
    return normalizeBlogTags(blog);
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
