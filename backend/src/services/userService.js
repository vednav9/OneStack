import prisma from "../config/db.js";
import { normalizeBlogTags } from "./blogService.js";

export async function getUserById(id) {
    return prisma.user.findUnique({
        where: { id },
        include: {
            _count: {
                select: { savedBlogs: true, likedBlogs: true, readingHistory: true }
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
        where: { userId },
        orderBy: { readAt: "desc" },
        take: 50,
        include: {
            blog: {
                include: {
                    tag: { include: { tag: true } },
                    _count: { select: { likedBy: true, history: true } },
                }
            }
        }
    });
    return records.map(r => ({ ...normalizeBlogTags(r.blog), readAt: r.readAt }));
}

export async function getSavedBlogs(userId) {
    const records = await prisma.savedBlog.findMany({
        where: { userId },
        orderBy: { id: "desc" },
        include: {
            blog: {
                include: {
                    tag: { include: { tag: true } },
                    _count: { select: { likedBy: true, history: true } },
                }
            }
        }
    });
    return records.map(r => normalizeBlogTags(r.blog));
}