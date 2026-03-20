import cron from "node-cron";
import { runCrawler } from "./rssCrawler.js";

cron.schedule("0 * * * *", () => {
    runCrawler();
});
