import axios from "axios";
import * as cheerio from "cheerio";
import prisma from "../config/db.js";
import redis from "../config/redis.js";
import { withNetworkRetry } from "../utils/network.js";

const CONTENT_CACHE_TTL = 60 * 60 * 6; // 6 hours
const CONTENT_CACHE_VERSION = "v2";
const NOISE_HINT_RE = /(comment|related|recommend|promo|banner|advert|\bads?\b|sidebar|nav|menu|footer|header|share|social|newsletter|subscribe|cookie|popup|modal|overlay|toc|table-of-contents|breadcrumb|author-bio|most-read|trending|read-more|you-might|outbrain|taboola|widget)/i;

function getContentCacheKey(id) {
    return `blog-content:${CONTENT_CACHE_VERSION}:${id}`;
}

function resolveUrl(src, origin) {
    if (!src) return null;
    if (src.startsWith("http://") || src.startsWith("https://")) return src;
    if (src.startsWith("//")) return "https:" + src;
    if (src.startsWith("/") && origin) return origin + src;
    return null;
}

function normalizeWhitespace(text = "") {
    return String(text).replace(/\s+/g, " ").trim();
}

function getNodeHints($node) {
    return `${$node.attr("id") || ""} ${$node.attr("class") || ""}`.toLowerCase();
}

function isLikelyNoiseNode($node) {
    return NOISE_HINT_RE.test(getNodeHints($node));
}

function hasNoiseAncestor($node) {
    let current = $node.parent();
    while (current.length) {
        if (isLikelyNoiseNode(current)) return true;
        current = current.parent();
    }
    return false;
}

function scoreContainer($, $el) {
    if (!$el?.length || isLikelyNoiseNode($el)) return Number.NEGATIVE_INFINITY;

    const text = normalizeWhitespace($el.text());
    const textLength = text.length;
    if (textLength < 260) return Number.NEGATIVE_INFINITY;

    const paragraphCount = $el.find("p").length;
    const headingCount = $el.find("h1, h2, h3").length;
    const imageCount = $el.find("img").length;
    const linkTextLength = normalizeWhitespace($el.find("a").text()).length;
    const linkDensity = textLength > 0 ? linkTextLength / textLength : 1;

    return (
        textLength +
        paragraphCount * 140 +
        headingCount * 45 +
        Math.min(imageCount, 8) * 20 -
        linkDensity * 900
    );
}

function pickBestContentContainer($, selectors) {
    let bestNode = null;
    let bestScore = Number.NEGATIVE_INFINITY;

    for (const sel of selectors) {
        $(sel).each((_, el) => {
            const $el = $(el);
            const score = scoreContainer($, $el);
            if (score > bestScore) {
                bestScore = score;
                bestNode = $el;
            }
        });
    }

    if (bestNode?.length) return bestNode;

    const fallbackSelectors = [
        '[itemprop="articleBody"]',
        '[class*="article-body"]',
        '[class*="post-content"]',
        '[class*="entry-content"]',
        "main article",
        "main section",
        "article",
        "main",
    ];

    for (const sel of fallbackSelectors) {
        const $candidate = $(sel).first();
        if ($candidate.length && normalizeWhitespace($candidate.text()).length > 200) {
            return $candidate;
        }
    }

    return $("body");
}

function getImageSrc($img, origin) {
    const srcset = $img.attr("srcset") || $img.attr("data-srcset") || "";
    const srcsetFirst = srcset.split(",")[0]?.trim()?.split(" ")[0] || "";

    const candidates = [
        $img.attr("src"),
        $img.attr("data-src"),
        $img.attr("data-lazy-src"),
        $img.attr("data-original"),
        $img.attr("data-url"),
        srcsetFirst,
    ];

    for (const candidate of candidates) {
        const resolved = resolveUrl(candidate || "", origin);
        if (resolved) return resolved;
    }

    return null;
}

function getImageDedupKey(src) {
    try {
        const url = new URL(src);
        return `${url.origin}${url.pathname}`.toLowerCase();
    } catch {
        return String(src).split("?")[0].split("#")[0].toLowerCase();
    }
}

function normalizeTextKey(text) {
    return normalizeWhitespace(String(text).toLowerCase())
        .replace(/[^\p{L}\p{N}\s]/gu, "")
        .trim();
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

    const { data } = await withNetworkRetry(
        () => axios.get(blog.sourceURL, {
            timeout: 15000,
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
                Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            },
        }),
        { attempts: 3, initialDelayMs: 350, maxDelayMs: 1800 }
    );

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

    const $container = pickBestContentContainer($, contentSelectors);
    const $work = $container.clone();

    $work.find(
        "nav, header, footer, aside, script, style, noscript, .ad, .ads, " +
        ".sidebar, .nav, .navigation, .menu, .comments, .related, .share, " +
        ".social, .newsletter, .signup, .subscribe, .cookie, .popup"
    ).remove();

    $work.find("*").each((_, node) => {
        const $node = $(node);
        if (isLikelyNoiseNode($node)) {
            $node.remove();
        }
    });

    const cleanNodes = [];
    const seenImages = new Set();
    const seenText = new Set();

    $work.find("h1, h2, h3, h4, h5, h6, p, ul, ol, blockquote, pre, figure, img").each((_, el) => {
        if (cleanNodes.length > 450) return;

        const $el = $(el);
        if (hasNoiseAncestor($el)) return;

        const tag = el.tagName?.toLowerCase();
        if (!tag) return;

        if (/^h[1-6]$/.test(tag)) {
            const text = normalizeWhitespace($el.text());
            const key = normalizeTextKey(text);
            if (!text || seenText.has(key)) return;
            seenText.add(key);
            cleanNodes.push(`<${tag}>${escapeHtml(text)}</${tag}>`);
        } else if (tag === "p") {
            const text = normalizeWhitespace($el.text());
            const key = normalizeTextKey(text);
            const linkTextLength = normalizeWhitespace($el.find("a").text()).length;
            const linkDensity = text.length ? linkTextLength / text.length : 0;

            if (text.length > 20) {
                if (seenText.has(key) || linkDensity > 0.72) return;
                seenText.add(key);
                const inner = $el.html() || "";
                cleanNodes.push(`<p>${inner}</p>`);
            }
        } else if (tag === "ul" || tag === "ol") {
            const items = [];
            $el.find("li").each((_, li) => {
                const text = normalizeWhitespace($(li).text());
                if (text) items.push(`<li>${escapeHtml(text)}</li>`);
            });
            const listTextKey = normalizeTextKey(items.join(" "));
            if (items.length && !seenText.has(listTextKey)) {
                seenText.add(listTextKey);
                cleanNodes.push(`<${tag}>${items.join("")}</${tag}>`);
            }
        } else if (tag === "blockquote") {
            const text = normalizeWhitespace($el.text());
            const key = normalizeTextKey(text);
            if (!text || seenText.has(key)) return;
            seenText.add(key);
            cleanNodes.push(`<blockquote>${escapeHtml(text)}</blockquote>`);
        } else if (tag === "pre") {
            const code = $el.text();
            if (code.trim()) cleanNodes.push(`<pre><code>${escapeHtml(code)}</code></pre>`);
        } else if (tag === "figure") {
            const imgEl = $el.find("img").first();
            const src = getImageSrc(imgEl, baseOrigin);
            const alt = imgEl.attr("alt") || "";
            const caption = normalizeWhitespace($el.find("figcaption").text());
            if (src && isValidImageSrc(src)) {
                const imageKey = getImageDedupKey(src);
                if (seenImages.has(imageKey)) return;
                seenImages.add(imageKey);
                cleanNodes.push(
                    `<figure><img src="${src}" alt="${escapeHtml(alt)}" loading="lazy" />${caption ? `<figcaption>${escapeHtml(caption)}</figcaption>` : ""}</figure>`
                );
            }
        } else if (tag === "img") {
            if ($el.parents("figure").length) return;

            const src = getImageSrc($el, baseOrigin);
            const alt = $el.attr("alt") || "";
            if (src && isValidImageSrc(src)) {
                const imageKey = getImageDedupKey(src);
                if (seenImages.has(imageKey)) return;
                seenImages.add(imageKey);
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
