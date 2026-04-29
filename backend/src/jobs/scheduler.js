import cron from "node-cron";
import { runCrawler } from "./rssCrawler.js";

// Run once per minute.
cron.schedule("* * * * *", () => {
    runCrawler();
});
