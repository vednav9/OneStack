import cron from "node-cron";
import { runCrawler } from "./rssCrawler.js";

// Run once per hour at minute 0.
cron.schedule("0 * * * *", () => {
    runCrawler();
});
