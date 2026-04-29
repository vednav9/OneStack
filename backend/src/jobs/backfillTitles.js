import "../config/env.js";
import prisma from "../config/db.js";
import { decode } from "html-entities";

const args = process.argv.slice(2);
const dryRun = args.includes("--dry");
const batchSize = 50;

async function backfillTitles() {
  let cursor = null;
  let processed = 0;
  let updated = 0;
  let skipped = 0;

  console.log("[titles] Backfill started", { dryRun, batchSize });

  while (true) {
    const blogs = await prisma.blog.findMany({
      take: batchSize,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      orderBy: { id: "asc" },
      select: { id: true, title: true, description: true },
    });

    if (!blogs.length) break;

    for (const blog of blogs) {
      const cleanTitle = decode(blog.title || "");
      const cleanDescription = decode(blog.description || "");

      const titleChanged = cleanTitle !== blog.title;
      const descChanged = cleanDescription !== blog.description;

      if (!titleChanged && !descChanged) {
        skipped += 1;
        processed += 1;
        cursor = blog.id;
        continue;
      }

      if (!dryRun) {
        await prisma.blog.update({
          where: { id: blog.id },
          data: {
            title: cleanTitle,
            description: cleanDescription,
          },
        });
      } else {
        if (titleChanged) console.log(`[dry] ${blog.title} → ${cleanTitle}`);
      }

      updated += 1;
      processed += 1;
      cursor = blog.id;
    }
  }

  console.log("[titles] Backfill complete", { processed, updated, skipped });
}

backfillTitles()
  .catch((err) => {
    console.error("[titles] Backfill failed:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });