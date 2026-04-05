import prisma from "../config/db.js";
import axios from "axios";
import redis from "../config/redis.js";
import { env } from "../config/env.js";

const EMBED_STATUS_CACHE_TTL_SECONDS = 60 * 60 * 6;

function getEmbedStatusCacheKey(url) {
    return `embed-status:${encodeURIComponent(url)}`;
}

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
        select: {
            id: true,
            title: true,
            description: true,
            sourceURL: true,
            sourceSite: true,
            author: true,
            publishedAt: true,
            createdAt: true,
            readTime: true,
            thumbnail: true,
            tag: { select: { tag: { select: { name: true } } } },
            _count: { select: { likedBy: true, history: true } },
        },
        orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
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

export async function getEmbedStatusByBlogId(id) {
    const blog = await prisma.blog.findUnique({
        where: { id },
        select: { sourceURL: true },
    });

    const url = blog?.sourceURL;
    if (!url) {
        return {
            embeddable: false,
            reason: "missing_source_url",
        };
    }

    const cacheKey = getEmbedStatusCacheKey(url);

    // Best-effort cache read; continue with live check if Redis is unavailable.
    try {
        const cached = await redis.get(cacheKey);
        if (cached) {
            return JSON.parse(cached);
        }
    } catch {
        // Ignore cache errors and fallback to live header check.
    }

    const response = await axios.get(url, {
        timeout: 12000,
        maxRedirects: 5,
        validateStatus: () => true,
    });

    const xFrameOptions = String(response.headers["x-frame-options"] || "").toUpperCase();
    const csp = String(response.headers["content-security-policy"] || "");
    const frameAncestorsBlocked = /frame-ancestors\s+[^;]*(?:'self'|'none')/i.test(csp);

    const blocked =
        xFrameOptions.includes("DENY") ||
        xFrameOptions.includes("SAMEORIGIN") ||
        frameAncestorsBlocked;

    const status = {
        embeddable: !blocked,
        reason: blocked ? "blocked_by_headers" : "allowed",
        headers: {
            xFrameOptions: xFrameOptions || null,
            contentSecurityPolicy: csp || null,
        },
    };

    // Best-effort cache write; never fail request because of Redis.
    try {
        await redis.set(cacheKey, JSON.stringify(status), "EX", EMBED_STATUS_CACHE_TTL_SECONDS);
    } catch {
        // Ignore cache errors.
    }

    return status;
}

const SUMMARY_CACHE_TTL_SECONDS = 60 * 60 * 24; // 24 hours

function getSummaryCacheKey(id) {
    return `blog-summary:${id}`;
}

/** Strip HTML tags from a string for cleaner text sent to Gemini */
function stripHtml(html) {
    if (!html) return "";
    return html
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s{2,}/g, " ")
        .trim();
}

export async function getBlogSummaryById(id) {
    const blog = await prisma.blog.findUnique({
        where: { id },
        select: {
            id: true,
            title: true,
            description: true,
            content: true,
            sourceSite: true,
        },
    });

    if (!blog) {
        throw new Error("Blog not found");
    }

    // --- Cache check ---
    const cacheKey = getSummaryCacheKey(id);
    try {
        const cached = await redis.get(cacheKey);
        if (cached) return JSON.parse(cached);
    } catch { /* ignore */ }

    // Strip HTML from content for cleaner AI input
    const plainContent = stripHtml(blog.content || "");
    const text = [blog.title, blog.description, plainContent]
        .filter(Boolean)
        .join("\n\n")
        .slice(0, 14000);

    if (!env.geminiApiKey) {
        return {
            tldr: blog.description || "Summary unavailable.",
            keyPoints: [],
            takeaways: [],
            shortParagraph: blog.description || "",
            source: blog.sourceSite || null,
            generatedBy: "fallback",
        };
    }

    const prompt = [
        "You are a technical blog summarizer. Return STRICT JSON only with these exact keys:",
        "- tldr: A short 1-sentence summary of what the article is about.",
        "- shortParagraph: A concise 3-4 sentence paragraph summary (no bullet points). Max 60 words.",
        "- keyPoints: An array of up to 10 short bullet point strings covering the main ideas. Each bullet max 15 words.",
        "- takeaways: An array of up to 5 actionable takeaway strings. Each max 12 words.",
        "Be factual, concise, and avoid marketing language.",
        "",
        `Source site: ${blog.sourceSite || "unknown"}`,
        "",
        text,
    ].join("\n");

    const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(env.geminiModel)}:generateContent?key=${encodeURIComponent(env.geminiApiKey)}`,
        {
            contents: [
                {
                    role: "user",
                    parts: [{ text: prompt }],
                },
            ],
            generationConfig: {
                temperature: 0.2,
                responseMimeType: "application/json",
            },
        },
        {
            headers: {
                "Content-Type": "application/json",
            },
            timeout: 25000,
        }
    );

    let raw = response?.data?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    if (raw.startsWith("```")) {
        raw = raw
            .replace(/^```(?:json)?\s*/i, "")
            .replace(/\s*```$/, "")
            .trim();
    }

    let parsed;
    try {
        parsed = JSON.parse(raw);
    } catch {
        parsed = {};
    }

    const result = {
        tldr: typeof parsed.tldr === "string" ? parsed.tldr : blog.description || "",
        shortParagraph: typeof parsed.shortParagraph === "string" ? parsed.shortParagraph : "",
        keyPoints: Array.isArray(parsed.keyPoints) ? parsed.keyPoints.filter(Boolean).slice(0, 10) : [],
        takeaways: Array.isArray(parsed.takeaways) ? parsed.takeaways.filter(Boolean).slice(0, 5) : [],
        source: blog.sourceSite || null,
        generatedBy: "gemini",
    };

    // Cache the result
    try {
        await redis.set(cacheKey, JSON.stringify(result), "EX", SUMMARY_CACHE_TTL_SECONDS);
    } catch { /* ignore */ }

    return result;
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
