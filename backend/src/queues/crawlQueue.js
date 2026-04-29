import { Queue } from "bullmq";
import connection from "../config/redis.js";

const disabledQueue = {
	add: async () => {
		console.warn("[crawl-queue] Redis is not configured; skipping job enqueue.");
		return null;
	},
};

export const crawlQueue = connection
	? new Queue("crawl", {
		connection,
		defaultJobOptions: {
			// Keep Redis memory bounded by aggressively pruning completed/failed jobs.
			removeOnComplete: 50,
			removeOnFail: 100,
			attempts: 2,
		},
	})
	: disabledQueue;
