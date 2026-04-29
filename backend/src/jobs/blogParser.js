import { Worker } from "bullmq";
import connection from "../config/redis.js";
import { summarizeNetworkError } from "../utils/network.js";
import { processCrawlJob } from "./crawlProcessor.js";

const startWorker = () => {
    const crawlWorker = new Worker(
        "crawl",
        async (job) => {
            await processCrawlJob(job.data);
        },
        { connection }
    );

    crawlWorker.on("failed", (job, error) => {
        console.warn(
            `[crawl-worker] Job ${job?.id || "unknown"} failed: ${summarizeNetworkError(error)}`
        );
    });

    crawlWorker.on("error", (error) => {
        console.warn(`[crawl-worker] ${summarizeNetworkError(error)}`);
    });
};

if (!connection) {
    console.warn("[crawl-worker] Redis is not configured; worker not started.");
} else if (connection.status === "ready") {
    startWorker();
} else {
    console.warn("[crawl-worker] Redis not ready; worker will start when connected.");
    connection.once("ready", startWorker);
}