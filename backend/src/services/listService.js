import prisma from "../config/db.js";
import { normalizeBlogTags } from "./blogService.js";

export async function getUserLists(userId) {
    const lists = await prisma.list.findMany({
        where: { userId },
        include: {
            blogs: {
                include: {
                    blog: {
                        include: {
                            tag: { include: { tag: true } },
                            _count: { select: { likedBy: true, history: true } },
                        },
                    },
                },
                orderBy: { id: "desc" },
            },
        },
        orderBy: { id: "desc" },
    });

    return lists.map((list) => ({
        id: list.id,
        name: list.name,
        userId: list.userId,
        count: list.blogs.length,
        blogs: list.blogs.map((lb) => normalizeBlogTags(lb.blog)),
    }));
}

export async function createList(userId, name) {
    return prisma.list.create({
        data: { name, userId },
    });
}

export async function deleteList(listId, userId) {
    return prisma.list.deleteMany({
        where: { id: listId, userId },
    });
}

export async function addBlogToList(listId, blogId) {
    return prisma.listBlog.create({
        data: { listId, blogId },
    });
}

export async function removeBlogFromList(listId, blogId) {
    return prisma.listBlog.deleteMany({
        where: { listId, blogId },
    });
}
