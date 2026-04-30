import prisma from "../config/db.js";

function normalizeComment(comment, userVoteMap) {
    const upvotes = comment._count?.upvotes ?? 0;
    const downvotes = comment._count?.downvotes ?? 0;
    const { _count, user, ...rest } = comment;

    return {
        ...rest,
        upvotes,
        downvotes,
        score: upvotes - downvotes,
        user: user ? { id: user.id, name: user.name, userPhoto: user.userPhoto } : null,
        userVote: userVoteMap?.[comment.id] || null,
    };
}

function sortComments(a, b) {
    if ((b.score ?? 0) !== (a.score ?? 0)) return (b.score ?? 0) - (a.score ?? 0);
    if ((b.upvotes ?? 0) !== (a.upvotes ?? 0)) return (b.upvotes ?? 0) - (a.upvotes ?? 0);
    return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
}

async function getUserVoteMap(userId, commentIds) {
    if (!userId || commentIds.length === 0) return {};

    const [upvotes, downvotes] = await Promise.all([
        prisma.commentUpvote.findMany({
            where: { userId, commentId: { in: commentIds } },
            select: { commentId: true },
        }),
        prisma.commentDownvote.findMany({
            where: { userId, commentId: { in: commentIds } },
            select: { commentId: true },
        }),
    ]);

    const voteMap = {};
    upvotes.forEach((item) => { voteMap[item.commentId] = "up"; });
    downvotes.forEach((item) => { voteMap[item.commentId] = "down"; });
    return voteMap;
}

export async function getCommentsByBlogId(blogId, userId) {
    const comments = await prisma.comment.findMany({
        where: { blogId },
        include: {
            user: { select: { id: true, name: true, userPhoto: true } },
            _count: { select: { upvotes: true, downvotes: true } },
        },
    });

    const ids = comments.map((comment) => comment.id);
    const voteMap = await getUserVoteMap(userId, ids);

    const normalized = comments.map((comment) => normalizeComment(comment, voteMap));
    return normalized.sort(sortComments);
}

export async function createComment(userId, blogId, content) {
    const comment = await prisma.comment.create({
        data: { userId, blogId, content },
        include: {
            user: { select: { id: true, name: true, userPhoto: true } },
            _count: { select: { upvotes: true, downvotes: true } },
        },
    });

    return normalizeComment(comment, { [comment.id]: null });
}

export async function upvoteComment(userId, commentId) {
    const [, vote] = await prisma.$transaction([
        prisma.commentDownvote.deleteMany({ where: { userId, commentId } }),
        prisma.commentUpvote.upsert({
            where: { userId_commentId: { userId, commentId } },
            update: {},
            create: { userId, commentId },
        }),
    ]);

    return vote;
}

export async function removeUpvoteComment(userId, commentId) {
    return prisma.commentUpvote.deleteMany({ where: { userId, commentId } });
}

export async function downvoteComment(userId, commentId) {
    const [, vote] = await prisma.$transaction([
        prisma.commentUpvote.deleteMany({ where: { userId, commentId } }),
        prisma.commentDownvote.upsert({
            where: { userId_commentId: { userId, commentId } },
            update: {},
            create: { userId, commentId },
        }),
    ]);

    return vote;
}

export async function removeDownvoteComment(userId, commentId) {
    return prisma.commentDownvote.deleteMany({ where: { userId, commentId } });
}
