import prisma from "../config/db.js";
import { normalizeBlogTags } from "./blogService.js";

export async function getUserLists(userId) {
    const [upvotedRecords, savedRecords, lists] = await Promise.all([
        prisma.blogUpvote.findMany({
            where: { userId, blog: { deletedAt: null } },
            orderBy: { id: "desc" },
            include: {
                blog: {
                    include: {
                        tag: { include: { tag: true } },
                        _count: { select: { upvotes: true, downvotes: true, history: true } },
                    },
                },
            },
        }),
        prisma.savedBlog.findMany({
            where: { userId, blog: { deletedAt: null } },
            orderBy: { id: "desc" },
            include: {
                blog: {
                    include: {
                        tag: { include: { tag: true } },
                        _count: { select: { upvotes: true, downvotes: true, history: true } },
                    },
                },
            },
        }),
        prisma.list.findMany({
            where: { userId },
            include: {
                blogs: {
                    where: { blog: { deletedAt: null } },
                    include: {
                        blog: {
                            include: {
                                tag: { include: { tag: true } },
                                _count: { select: { upvotes: true, downvotes: true, history: true } },
                            },
                        },
                    },
                    orderBy: { id: "desc" },
                },
            },
            orderBy: { id: "desc" },
        }),
    ]);

    const defaultLists = [
        {
            id: "default-like",
            name: "Upvoted",
            userId,
            isDefault: true,
            count: upvotedRecords.length,
            blogs: upvotedRecords.map((entry) => normalizeBlogTags(entry.blog)),
        },
        {
            id: "default-saved",
            name: "Saved",
            userId,
            isDefault: true,
            count: savedRecords.length,
            blogs: savedRecords.map((entry) => normalizeBlogTags(entry.blog)),
        },
    ];

    const customLists = lists.map((list) => ({
        id: list.id,
        name: list.name,
        userId: list.userId,
        isDefault: false,
        count: list.blogs.length,
        blogs: list.blogs.map((lb) => normalizeBlogTags(lb.blog)),
    }));

    return [...defaultLists, ...customLists];
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
