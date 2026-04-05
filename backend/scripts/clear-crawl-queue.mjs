import "dotenv/config";
import { crawlQueue } from "../src/queues/crawlQueue.js";

async function main() {
  await crawlQueue.obliterate({ force: true });
  console.log("Crawl queue cleared.");
}

main()
  .catch((err) => {
    console.error("Failed to clear crawl queue:", err);
    process.exit(1);
  })
  .finally(async () => {
    await crawlQueue.close();
  });
