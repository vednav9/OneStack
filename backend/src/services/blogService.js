import prisma from "../config/db.js";
import axios from "axios";
import redis from "../config/redis.js";
import { env } from "../config/env.js";
import { withNetworkRetry } from "../utils/network.js";

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

    const response = await withNetworkRetry(
        () => axios.get(url, {
            timeout: 12000,
            maxRedirects: 5,
            validateStatus: () => true,
        }),
        { attempts: 3, initialDelayMs: 300, maxDelayMs: 1600 }
    );

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

function splitIntoSentences(text = "") {
    return String(text)
        .replace(/\s+/g, " ")
        .match(/[^.!?]+[.!?]+|[^.!?]+$/g)
        ?.map((s) => s.trim())
        .filter((s) => s.length > 20) || [];
}

function truncateWords(text = "", maxWords = 15) {
    const words = String(text).trim().split(/\s+/).filter(Boolean);
    if (words.length <= maxWords) return words.join(" ");
    return `${words.slice(0, maxWords).join(" ")}...`;
}

function buildFallbackSummary(blog, plainContent) {
    const combined = [blog.title, blog.description, plainContent]
        .filter(Boolean)
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();

    const sentences = splitIntoSentences(combined);
    const tldrSentence = sentences[0] || blog.description || `This article discusses ${blog.title}.`;
    const paragraph = sentences.slice(0, 3).join(" ") || tldrSentence;

    const keyPoints = sentences
        .slice(0, 8)
        .map((s) => truncateWords(s, 15));

    const takeaways = (keyPoints.length ? keyPoints : [tldrSentence])
        .slice(0, 5)
        .map((s) => truncateWords(s, 12));

    return {
        tldr: truncateWords(tldrSentence, 24),
        shortParagraph: paragraph,
        keyPoints,
        takeaways,
        source: blog.sourceSite || null,
        generatedBy: "fallback",
    };
}

function getGeminiModelCandidates(primaryModel) {
    const candidates = [
        primaryModel,
        "gemini-2.5-flash",
        "gemini-2.0-flash",
        "gemini-1.5-flash-latest",
        "gemini-1.5-flash",
    ].filter(Boolean);

    return [...new Set(candidates)];
}

function cleanGeminiJson(raw = "") {
    let value = String(raw || "").trim();
    if (!value) return "{}";

    if (value.startsWith("```")) {
        value = value
            .replace(/^```(?:json)?\s*/i, "")
            .replace(/\s*```$/, "")
            .trim();
    }

    return value;
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
    const fallbackSummary = buildFallbackSummary(blog, plainContent);

    const text = [blog.title, blog.description, plainContent]
        .filter(Boolean)
        .join("\n\n")
        .slice(0, 14000);

    if (!env.geminiApiKey) {
        return fallbackSummary;
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

    let parsed = null;
    let lastProviderError = null;
    const geminiModels = getGeminiModelCandidates(env.geminiModel);

    for (const model of geminiModels) {
        try {
            const response = await axios.post(
                `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(env.geminiApiKey)}`,
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

            const raw = cleanGeminiJson(response?.data?.candidates?.[0]?.content?.parts?.[0]?.text || "{}");
            const json = JSON.parse(raw);
            if (json && typeof json === "object") {
                parsed = json;
                break;
            }
        } catch (error) {
            lastProviderError = error;
        }
    }

    const result = parsed
        ? {
            tldr: typeof parsed.tldr === "string" && parsed.tldr.trim() ? parsed.tldr : fallbackSummary.tldr,
            shortParagraph: typeof parsed.shortParagraph === "string" && parsed.shortParagraph.trim() ? parsed.shortParagraph : fallbackSummary.shortParagraph,
            keyPoints: Array.isArray(parsed.keyPoints) && parsed.keyPoints.length
                ? parsed.keyPoints.filter(Boolean).slice(0, 10)
                : fallbackSummary.keyPoints,
            takeaways: Array.isArray(parsed.takeaways) && parsed.takeaways.length
                ? parsed.takeaways.filter(Boolean).slice(0, 5)
                : fallbackSummary.takeaways,
            source: blog.sourceSite || null,
            generatedBy: "gemini",
        }
        : fallbackSummary;

    if (!parsed && lastProviderError) {
        const status = lastProviderError?.response?.status;
        const message = lastProviderError?.response?.data?.error?.message || lastProviderError.message;
        console.warn(`[summary] Gemini unavailable (status=${status || "NA"}): ${message}`);
    }

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
