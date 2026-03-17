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
