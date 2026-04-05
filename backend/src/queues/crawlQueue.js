import { Queue } from "bullmq";
import connection from "../config/redis.js";

export const crawlQueue = new Queue("crawl", {
	connection,
	defaultJobOptions: {
		// Keep Redis memory bounded by aggressively pruning completed/failed jobs.
		removeOnComplete: 50,
		removeOnFail: 100,
		attempts: 2,
	},
});
