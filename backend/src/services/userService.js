import prisma from "../config/db.js";
import { normalizeBlogTags } from "./blogService.js";

export async function getUserById(id) {
    return prisma.user.findUnique({
        where: { id },
        include: {
            _count: {
                select: { savedBlogs: true, blogUpvotes: true, blogDownvotes: true, readingHistory: true }
            }
        }
    });
}

export async function updateUser(id, data) {
    return prisma.user.update({
        where: { id },
        data
    });
}

export async function followedTopic(userId, tagId) {
    return prisma.followedTopic.create({
        data: { userId, tagId }
    });
}

export async function getHistory(userId) {
    const records = await prisma.readingHistory.findMany({
        where: { userId, blog: { deletedAt: null } },
        orderBy: { readAt: "desc" },
        take: 50,
        include: {
            blog: {
                include: {
                    tag: { include: { tag: true } },
                    _count: { select: { upvotes: true, downvotes: true, history: true } },
                }
            }
        }
    });
    return records.map(r => ({ ...normalizeBlogTags(r.blog), readAt: r.readAt }));
}

export async function getSavedBlogs(userId) {
    const records = await prisma.savedBlog.findMany({
        where: { userId, blog: { deletedAt: null } },
        orderBy: { id: "desc" },
        include: {
            blog: {
                include: {
                    tag: { include: { tag: true } },
                    _count: { select: { upvotes: true, downvotes: true, history: true } },
                }
            }
        }
    });
    return records.map(r => normalizeBlogTags(r.blog));
}

export async function getUpvotedBlogs(userId) {
    const records = await prisma.blogUpvote.findMany({
        where: { userId, blog: { deletedAt: null } },
        orderBy: { id: "desc" },
        include: {
            blog: {
                include: {
                    tag: { include: { tag: true } },
                    _count: { select: { upvotes: true, downvotes: true, history: true } },
                }
            }
        }
    });
    return records.map(r => normalizeBlogTags(r.blog));
}

export async function getDownvotedBlogs(userId) {
    const records = await prisma.blogDownvote.findMany({
        where: { userId, blog: { deletedAt: null } },
        orderBy: { id: "desc" },
        include: {
            blog: {
                include: {
                    tag: { include: { tag: true } },
                    _count: { select: { upvotes: true, downvotes: true, history: true } },
                }
            }
        }
    });
    return records.map(r => normalizeBlogTags(r.blog));
}

export async function deleteUserAccount(userId) {
    const [commentIds, listIds] = await Promise.all([
        prisma.comment.findMany({ where: { userId }, select: { id: true } }),
        prisma.list.findMany({ where: { userId }, select: { id: true } }),
    ]);

    const commentIdList = commentIds.map((c) => c.id);
    const listIdList = listIds.map((l) => l.id);

    const operations = [
        prisma.commentUpvote.deleteMany({ where: { userId } }),
        prisma.commentDownvote.deleteMany({ where: { userId } }),
        prisma.savedBlog.deleteMany({ where: { userId } }),
        prisma.blogUpvote.deleteMany({ where: { userId } }),
        prisma.blogDownvote.deleteMany({ where: { userId } }),
        prisma.readingHistory.deleteMany({ where: { userId } }),
        prisma.followedTopic.deleteMany({ where: { userId } }),
        prisma.refreshToken.deleteMany({ where: { userId } }),
    ];

    if (commentIdList.length > 0) {
        operations.push(
            prisma.commentUpvote.deleteMany({ where: { commentId: { in: commentIdList } } }),
            prisma.commentDownvote.deleteMany({ where: { commentId: { in: commentIdList } } }),
            prisma.comment.deleteMany({ where: { id: { in: commentIdList } } })
        );
    } else {
        operations.push(prisma.comment.deleteMany({ where: { userId } }));
    }

    if (listIdList.length > 0) {
        operations.push(
            prisma.listBlog.deleteMany({ where: { listId: { in: listIdList } } })
        );
    }

    operations.push(
        prisma.list.deleteMany({ where: { userId } }),
        prisma.user.delete({ where: { id: userId } })
    );

    await prisma.$transaction(operations);
}