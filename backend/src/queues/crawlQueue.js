import { Queue } from "bullmq";
import connection from "../config/redis.js";

export const crawlQueue = new Queue("crawl", { connection });
