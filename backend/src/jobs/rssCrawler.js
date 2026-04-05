import Parser from "rss-parser";
import { crawlQueue } from "../queues/crawlQueue.js";
import { fileURLToPath } from "url";

const parser = new Parser();
const MAX_ITEMS_PER_FEED = 30;

const feeds = [
    "https://openai.com/blog/rss.xml",
    "https://dev.to/feed",
    "https://blog.cloudflare.com/rss/",
    "https://techcrunch.com/feed/",
    "https://www.theverge.com/rss/index.xml",
];

export async function runCrawler() {
    console.log("Starting crawler...");
    for (const feed of feeds) {
        console.log(`Crawling ${feed}...`);
        try {
            const data = await parser.parseURL(feed);
            const items = (data.items || []).slice(0, MAX_ITEMS_PER_FEED);
            console.log(`Found ${data.items.length} items in ${feed} (processing ${items.length})`);

            for (const item of items) {
                if (!item?.link || !item?.title) continue;

                await crawlQueue.add("crawlBlog", {
                    url: item.link,
                    title: item.title,
                    publishedAt: item.isoDate || item.pubDate || null,
                    author: item.creator || item["dc:creator"] || item.author || null,
                }, {
                    // De-duplicate at queue level across repeated crawler runs.
                    jobId: item.link,
                });
            }
            console.log(`Added items from ${feed} to queue.`);
        } catch (error) {
            console.error(`Failed to crawl ${feed}:`, error.message);
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
