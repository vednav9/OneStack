import axios from "axios";
import * as cheerio from "cheerio";
import prisma from "../config/db.js";
import { generateTags } from "../utils/tagGenerator.js";
import { withNetworkRetry, summarizeNetworkError } from "../utils/network.js";

/**
 * Extracts structured HTML content from a loaded cheerio document.
 * Preserves paragraphs, headings, images, lists, blockquotes, code blocks.
 * Returns both the HTML string and a plain-text description.
 */
function extractStructuredContent($, url) {
    const contentSelectors = [
        "article",
        '[role="main"]',
        ".post-content",
        ".article-content",
        ".entry-content",
        ".content-body",
        "#content",
        ".post-body",
        ".story-body",
        "main",
    ];

    let $container = null;
    for (const sel of contentSelectors) {
        const el = $(sel).first();
        if (el.length && el.text().trim().length > 200) {
            $container = el;
            break;
        }
    }

    if (!$container) {
        $container = $("body");
    }

    $container.find(
        "nav, header, footer, aside, script, style, noscript, .ad, .ads, .advertisement, " +
        ".sidebar, .nav, .navigation, .menu, .comments, .related, .share, .social, " +
        ".newsletter, .signup, .subscribe, .cookie, .popup, .modal, .overlay, " +
        '[class*="promo"], [class*="banner"], [id*="sidebar"], [id*="comments"]'
    ).remove();

    const cleanNodes = [];
    const baseOrigin = (() => {
        try { return new URL(url).origin; } catch { return ""; }
    })();

    $container.find("h1, h2, h3, h4, h5, h6, p, ul, ol, blockquote, pre, figure, img").each((_, el) => {
        const tag = el.tagName?.toLowerCase();
        if (!tag) return;

        if (/^h[1-6]$/.test(tag)) {
            const text = $(el).text().trim();
            if (text) cleanNodes.push(`<${tag}>${escapeHtml(text)}</${tag}>`);
        } else if (tag === "p") {
            const text = $(el).text().trim();
            if (text.length > 20) {
                const inner = $(el).html() || "";
                cleanNodes.push(`<p>${inner}</p>`);
            }
        } else if (tag === "ul" || tag === "ol") {
            const items = [];
            $(el).find("li").each((_, li) => {
                const text = $(li).text().trim();
                if (text) items.push(`<li>${escapeHtml(text)}</li>`);
            });
            if (items.length) cleanNodes.push(`<${tag}>${items.join("")}</${tag}>`);
        } else if (tag === "blockquote") {
            const text = $(el).text().trim();
            if (text) cleanNodes.push(`<blockquote>${escapeHtml(text)}</blockquote>`);
        } else if (tag === "pre") {
            const code = $(el).text();
            if (code.trim()) cleanNodes.push(`<pre><code>${escapeHtml(code)}</code></pre>`);
        } else if (tag === "figure") {
            const imgEl = $(el).find("img").first();
            const src = resolveUrl(
                imgEl.attr("src") || imgEl.attr("data-src") || imgEl.attr("data-lazy-src") || "",
                baseOrigin
            );
            const alt = imgEl.attr("alt") || "";
            const caption = $(el).find("figcaption").text().trim();
            if (src && isValidImageSrc(src)) {
                cleanNodes.push(
                    `<figure><img src="${src}" alt="${escapeHtml(alt)}" loading="lazy" />${caption ? `<figcaption>${escapeHtml(caption)}</figcaption>` : ""}</figure>`
                );
            }
        } else if (tag === "img") {
            const src = resolveUrl(
                $(el).attr("src") || $(el).attr("data-src") || $(el).attr("data-lazy-src") || "",
                baseOrigin
            );
            const alt = $(el).attr("alt") || "";
            if (src && isValidImageSrc(src)) {
                cleanNodes.push(`<figure><img src="${src}" alt="${escapeHtml(alt)}" loading="lazy" /></figure>`);
            }
        }
    });

    const contentHtml = cleanNodes.join("\n");

    const description = $container.find("p")
        .map((_, el) => $(el).text().trim())
        .get()
        .filter((t) => t.length > 30)
        .slice(0, 3)
        .join(" ")
        .slice(0, 500);

    return { contentHtml, description };
}

function extractThumbnail($, url) {
    const baseOrigin = (() => {
        try { return new URL(url).origin; } catch { return ""; }
    })();

    const candidates = [
        $('meta[property="og:image"]').attr("content"),
        $('meta[name="twitter:image"]').attr("content"),
        $('meta[property="og:image:secure_url"]').attr("content"),
        $("article img").first().attr("src"),
        $("article img").first().attr("data-src"),
        $(".post-thumbnail img").first().attr("src"),
        $(".featured-image img").first().attr("src"),
    ];

    for (const candidate of candidates) {
        const resolved = resolveUrl(candidate || "", baseOrigin);
        if (resolved && isValidImageSrc(resolved)) return resolved;
    }
    return null;
}

function resolveUrl(src, origin) {
    if (!src) return null;
    if (src.startsWith("http://") || src.startsWith("https://")) return src;
    if (src.startsWith("//")) return "https:" + src;
    if (src.startsWith("/") && origin) return origin + src;
    return null;
}

function isValidImageSrc(src) {
    if (!src) return false;
    if (src.startsWith("data:")) return false;
    if (/\.(gif)(\?|$)/i.test(src) && src.includes("pixel")) return false;
    return true;
}

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

function normalizeWhitespace(text = "") {
    return String(text).replace(/\s+/g, " ").trim();
}

function toPlainText(html = "") {
    if (!html) return "";
    try {
        const $ = cheerio.load(`<body>${html}</body>`);
        return normalizeWhitespace($("body").text());
    } catch {
        return normalizeWhitespace(html);
    }
}

export async function processCrawlJob({ url, title, publishedAt, author, categories, summary, content, thumbnail: rssThumbnail }) {
    if (!url || !title) return null;

    let html = null;
    try {
        const { data } = await withNetworkRetry(
            () => axios.get(url, {
                timeout: 15000,
                headers: {
                    "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
                    Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                },
            }),
            { attempts: 3, initialDelayMs: 350, maxDelayMs: 2000 }
        );
        html = data;
    } catch (error) {
        console.warn(`Failed to fetch ${url}: ${summarizeNetworkError(error)}. Using RSS fallback.`);
    }

    const rssPlain = toPlainText([summary, content].filter(Boolean).join(" "));
    const rssSnippet = rssPlain.slice(0, 2000);

    let contentHtml = "";
    let description = "";
    let thumbnail = rssThumbnail || null;
    let metaTags = "";
    let bodyText = "";

    if (html) {
        const $ = cheerio.load(html);
        const extracted = extractStructuredContent($, url);
        contentHtml = extracted.contentHtml || "";
        description = extracted.description || "";
        thumbnail = extractThumbnail($, url) || thumbnail;
        bodyText = $("body").text().slice(0, 2000);

        metaTags = [
            ...$("meta[name=\"keywords\"]")
                .map((_, el) => $(el).attr("content"))
                .get(),
            ...$("meta[name=\"news_keywords\"]")
                .map((_, el) => $(el).attr("content"))
                .get(),
            ...$("meta[property=\"article:tag\"]")
                .map((_, el) => $(el).attr("content"))
                .get(),
        ]
            .filter(Boolean)
            .join(" ");

        if (!description && rssPlain) {
            description = rssPlain.slice(0, 500);
        }
        if (!contentHtml && rssPlain) {
            contentHtml = `<p>${escapeHtml(rssPlain)}</p>`;
        }
    } else {
        description = rssPlain.slice(0, 500);
        contentHtml = rssPlain ? `<p>${escapeHtml(rssPlain)}</p>` : "";
    }

    const sourceSite = new URL(url).hostname;

    const categoryText = Array.isArray(categories) ? categories.join(" ") : "";
    const plainText = normalizeWhitespace(
        `${title} ${description} ${metaTags} ${categoryText} ${rssSnippet} ${bodyText}`
    );
    const generatedTags = generateTags(plainText);
    const tagCreates = generatedTags.map((name) => ({
        tag: {
            connectOrCreate: {
                where: { name },
                create: { name },
            },
        },
    }));

    const parsedPublishedAt = publishedAt ? new Date(publishedAt) : null;
    const normalizedAuthor = typeof author === "string" ? author.trim() : "";
    const authorValue = normalizedAuthor || undefined;
    const publishedAtValue =
        parsedPublishedAt && !Number.isNaN(parsedPublishedAt.getTime())
            ? parsedPublishedAt
            : undefined;

    const contentValue = contentHtml || undefined;
    const descriptionValue = description || undefined;
    const thumbnailValue = thumbnail || undefined;

    const blog = await prisma.blog.upsert({
        where: { sourceURL: url },
        update: {
            title,
            description: descriptionValue,
            content: contentValue,
            sourceSite,
            author: authorValue,
            publishedAt: publishedAtValue,
            thumbnail: thumbnailValue,
            ...(generatedTags.length
                ? {
                    tag: {
                        deleteMany: {},
                        create: tagCreates,
                    },
                }
                : {}),
        },
        create: {
            title,
            description: descriptionValue,
            content: contentValue,
            sourceURL: url,
            sourceSite,
            author: authorValue,
            publishedAt: publishedAtValue,
            thumbnail: thumbnailValue,
            tag: {
                create: tagCreates,
            },
        },
    });

    await prisma.$executeRaw`
        UPDATE "Blog"
        SET "searchVector" = to_tsvector(
            'english',
            coalesce("title", '') || ' ' ||
            coalesce("description", '') || ' ' ||
            coalesce("content", '')
        )
        WHERE "id" = ${blog.id}
    `;

    return blog;
}
