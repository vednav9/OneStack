import Parser from "rss-parser";
import { crawlQueue } from "../queues/crawlQueue.js";
import { processCrawlJob } from "./crawlProcessor.js";
import { fileURLToPath } from "url";
import { summarizeNetworkError, withNetworkRetry } from "../utils/network.js";
import connection from "../config/redis.js";
import crypto from "crypto";
import { decode } from "html-entities";

const parser = new Parser();
const MAX_ITEMS_PER_FEED = 30;
let warnedQueueUnavailable = false;

const pickString = (...values) =>
    values.find((value) => typeof value === "string" && value.trim().length > 0) || "";

const feeds = [
    "https://openai.com/blog/rss.xml",
    "https://dev.to/feed",
    "https://blog.cloudflare.com/rss/",
    "https://techcrunch.com/feed/",
    "https://www.theverge.com/rss/index.xml",
    "https://netflixtechblog.com/feed",
    "https://eng.uber.com/feed/",
    "https://engineering.atspotify.com/feed/",
    "https://github.blog/feed/",
    "https://dropbox.tech/feed",
    "https://slack.engineering/feed/",
    "https://medium.com/feed/airbnb-engineering",
    "https://aws.amazon.com/blogs/aws/feed/",
    "https://cloud.google.com/blog/rss",
    "https://vercel.com/blog/rss",
    "https://www.digitalocean.com/blog/rss.xml",
    "https://stripe.com/blog/feed.xml",
    "https://engineering.fb.com/feed/",
    "https://discord.com/blog/rss",
    "https://shopify.engineering/blog.atom",
];

export async function runCrawler() {
    console.log("Starting crawler...");
    for (const feed of feeds) {
        console.log(`Crawling ${feed}...`);
        try {
            const data = await withNetworkRetry(
                () => parser.parseURL(feed),
                { attempts: 3, initialDelayMs: 300, maxDelayMs: 1800 }
            );
            const items = (data.items || []).slice(0, MAX_ITEMS_PER_FEED);
            const totalItems = (data.items || []).length;
            console.log(`Found ${totalItems} items in ${feed} (processing ${items.length})`);

            for (const item of items) {
                if (!item?.link || !item?.title) continue;

                const rssSummary = pickString(
                    item.contentSnippet,
                    item.summary,
                    item.content,
                    item["content:encoded"]
                );
                const rssContent = pickString(
                    item["content:encoded"],
                    item.content,
                    item.summary
                );
                const rssThumbnail =
                    item.enclosure?.url ||
                    item.itunes?.image ||
                    item.image?.url ||
                    (typeof item.image === "string" ? item.image : null);

                const job = {
                    url: item.link,
                    title: decode(item.title),
                    publishedAt: item.isoDate || item.pubDate || null,
                    author: item.creator || item["dc:creator"] || item.author || null,
                    categories: Array.isArray(item.categories)
                        ? item.categories
                        : item.categories
                            ? [item.categories]
                            : [],
                    summary: rssSummary,
                    content: rssContent,
                    thumbnail: rssThumbnail,
                };

                const queueReady = connection && connection.status === "ready";
                if (!queueReady) {
                    if (!warnedQueueUnavailable) {
                        warnedQueueUnavailable = true;
                        console.warn("[crawl-queue] Redis not ready; processing items directly.");
                    }
                    try {
                        await processCrawlJob(job);
                    } catch (processError) {
                        console.error(
                            `Failed to process ${item.link}: ${summarizeNetworkError(processError)}`
                        );
                    }
                    continue;
                }

                try {
                    await crawlQueue.add("crawlBlog", job, {
                        // De-duplicate at queue level across repeated crawler runs.
                        jobId: crypto.createHash("md5").update(item.link).digest("hex"),
                    });
                } catch (queueError) {
                    console.warn(
                        `[crawl-queue] enqueue failed (${summarizeNetworkError(queueError)}). Processing directly.`
                    );
                    try {
                        await processCrawlJob(job);
                    } catch (processError) {
                        console.error(
                            `Failed to process ${item.link}: ${summarizeNetworkError(processError)}`
                        );
                    }
                }
            }
            console.log(`Added items from ${feed} to queue.`);
        } catch (error) {
            console.error(`Failed to crawl ${feed}: ${summarizeNetworkError(error)}`);
        }
    }
    console.log("Crawler run complete.");
}

// Execute if run directly as script
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    runCrawler()
        .then(() => {
            console.log("Exiting process...");
            // Allow queues to process pending commands then exit
            setTimeout(() => process.exit(0), 1000);
        })
        .catch((err) => {
            console.error("Crawler failed:", err);
            process.exit(1);
        });
}
