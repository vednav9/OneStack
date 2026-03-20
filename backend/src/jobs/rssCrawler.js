import Parser from "rss-parser";
import { crawlQueue } from "../queues/crawlQueue.js";
import { fileURLToPath } from "url";

const parser = new Parser();

const feeds = ["https://openai.com/blog/rss.xml", "https://dev.to/feed"];

export async function runCrawler() {
    console.log("Starting crawler...");
    for (const feed of feeds) {
        console.log(`Crawling ${feed}...`);
        try {
            const data = await parser.parseURL(feed);
            console.log(`Found ${data.items.length} items in ${feed}`);

            for (const item of data.items) {
                await crawlQueue.add("crawlBlog", {
                    url: item.link,
                    title: item.title,
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
