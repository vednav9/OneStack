import axios from "axios";
import * as cheerio from "cheerio";
import prisma from "../config/db.js";
import redis from "../config/redis.js";

const CONTENT_CACHE_TTL = 60 * 60 * 6; // 6 hours

function getContentCacheKey(id) {
    return `blog-content:${id}`;
}

function resolveUrl(src, origin) {
    if (!src) return null;
    if (src.startsWith("http://") || src.startsWith("https://")) return src;
    if (src.startsWith("//")) return "https:" + src;
    if (src.startsWith("/") && origin) return origin + src;
    return null;
}

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

function isValidImageSrc(src) {
    if (!src) return false;
    if (src.startsWith("data:")) return false;
    if (src.includes("pixel") && /\.(gif)(\?|$)/i.test(src)) return false;
    return true;
}

/**
 * Fetch fresh, structured HTML content from the blog's source URL.
 * Returns { content, thumbnail } or throws.
 */
export async function fetchFreshContent(blogId) {
    // Cache check
    const cacheKey = getContentCacheKey(blogId);
    try {
        const cached = await redis.get(cacheKey);
        if (cached) return JSON.parse(cached);
    } catch { /* ignore */ }

    const blog = await prisma.blog.findUnique({
        where: { id: blogId },
        select: { sourceURL: true, thumbnail: true },
    });

    if (!blog?.sourceURL) throw new Error("Blog has no source URL");

    const { data } = await axios.get(blog.sourceURL, {
        timeout: 15000,
        headers: {
            "User-Agent":
                "Mozilla/5.0 (compatible; BlogSphereBot/1.0; +https://blogsphere.app/bot)",
            Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
    });

    const $ = cheerio.load(data);
    const baseOrigin = (() => {
        try { return new URL(blog.sourceURL).origin; } catch { return ""; }
    })();

    // Priority article container selectors
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
    if (!$container) $container = $("body");

    $container.find(
        "nav, header, footer, aside, script, style, noscript, .ad, .ads, " +
        ".sidebar, .nav, .navigation, .menu, .comments, .related, .share, " +
        ".social, .newsletter, .signup, .subscribe, .cookie, .popup"
    ).remove();

    const cleanNodes = [];
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
            const src = resolveUrl(imgEl.attr("src") || imgEl.attr("data-src") || "", baseOrigin);
            const alt = imgEl.attr("alt") || "";
            const caption = $(el).find("figcaption").text().trim();
            if (src && isValidImageSrc(src)) {
                cleanNodes.push(
                    `<figure><img src="${src}" alt="${escapeHtml(alt)}" loading="lazy" />${caption ? `<figcaption>${escapeHtml(caption)}</figcaption>` : ""}</figure>`
                );
            }
        } else if (tag === "img") {
            const src = resolveUrl($(el).attr("src") || $(el).attr("data-src") || "", baseOrigin);
            const alt = $(el).attr("alt") || "";
            if (src && isValidImageSrc(src)) {
                cleanNodes.push(`<figure><img src="${src}" alt="${escapeHtml(alt)}" loading="lazy" /></figure>`);
            }
        }
    });

    // Try to get a better thumbnail from OG tags if not already set
    const ogImage = $('meta[property="og:image"]').attr("content") ||
        $('meta[name="twitter:image"]').attr("content");
    const resolvedOgImage = resolveUrl(ogImage || "", baseOrigin);

    const result = {
        content: cleanNodes.join("\n"),
        thumbnail: blog.thumbnail || (resolvedOgImage && isValidImageSrc(resolvedOgImage) ? resolvedOgImage : null),
        fetchedAt: new Date().toISOString(),
    };

    try {
        await redis.set(cacheKey, JSON.stringify(result), "EX", CONTENT_CACHE_TTL);
    } catch { /* ignore */ }

    return result;
}
