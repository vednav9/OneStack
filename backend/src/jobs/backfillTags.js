import "../config/env.js";
import prisma from "../config/db.js";
import { generateTags } from "../utils/tagGenerator.js";

const args = process.argv.slice(2);
const dryRun = args.includes("--dry");
const limitArg = args.find((arg) => arg.startsWith("--limit="));
const limit = limitArg ? Number(limitArg.split("=")[1]) : null;
const batchSize = Number(process.env.TAG_BACKFILL_BATCH || 50);

function buildTagCreates(tags) {
  return tags.map((name) => ({
    tag: {
      connectOrCreate: {
        where: { name },
        create: { name },
      },
    },
  }));
}

async function backfillTags() {
  let cursor = null;
  let processed = 0;
  let updated = 0;
  let skipped = 0;

  console.log("[tags] Backfill started", { dryRun, limit, batchSize });

  while (true) {
    const blogs = await prisma.blog.findMany({
      take: batchSize,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      orderBy: { id: "asc" },
      select: { id: true, title: true, description: true, content: true },
    });

    if (!blogs.length) break;

    for (const blog of blogs) {
      if (limit && processed >= limit) break;

      const text = `${blog.title || ""} ${blog.description || ""} ${blog.content || ""}`;
      const generatedTags = generateTags(text);

      if (!generatedTags.length) {
        skipped += 1;
        processed += 1;
        cursor = blog.id;
        continue;
      }

      if (!dryRun) {
        await prisma.blog.update({
          where: { id: blog.id },
          data: {
            tag: {
              deleteMany: {},
              create: buildTagCreates(generatedTags),
            },
          },
        });
      }

      updated += 1;
      processed += 1;
      cursor = blog.id;
    }

    if (limit && processed >= limit) break;
  }

  console.log("[tags] Backfill complete", { processed, updated, skipped });
}

backfillTags()
  .catch((err) => {
    console.error("[tags] Backfill failed:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
