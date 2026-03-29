import { Worker } from "bullmq";
import connection from "../config/redis.js";
import axios from "axios";
import * as cheerio from "cheerio";
import prisma from "../config/db.js";
import { generateTags } from "../utils/tagGenerator.js";

new Worker(
    "crawl",
    async (job) => {
        const { url, title, publishedAt, author } = job.data;
        const { data } = await axios.get(url, { timeout: 15000 });
        const $ = cheerio.load(data);
        const description = $("p").first().text().trim();
        const content = $("article p")
            .map((_, el) => $(el).text().trim())
            .get()
            .filter(Boolean)
            .join("\n") || description;
        const sourceSite = new URL(url).hostname;
        const generatedTags = generateTags(`${title} ${description} ${content}`);
        const parsedPublishedAt = publishedAt ? new Date(publishedAt) : null;
        const normalizedAuthor = typeof author === "string" ? author.trim() : "";
        const authorValue = normalizedAuthor || undefined;
        const publishedAtValue =
            parsedPublishedAt && !Number.isNaN(parsedPublishedAt.getTime())
                ? parsedPublishedAt
                : undefined;

        const blog = await prisma.blog.upsert({
            where: { sourceURL: url },
            update: {
                title,
                description,
                content,
                sourceSite,
                author: authorValue,
                publishedAt: publishedAtValue,
            },
            create: {
                title,
                description,
                content,
                sourceURL: url,
                sourceSite,
                author: authorValue,
                publishedAt: publishedAtValue,
                tag: {
                    create: generatedTags.map((name) => ({
                        tag: {
                            connectOrCreate: {
                                where: { name },
                                create: { name },
                            },
                        },
                    })),
                },
            },
        });

        await prisma.$executeRaw`
            UPDATE "Blog"
            SET "searchVector" = to_tsvector(
                'english',
                coalesce("title", '') || ' ' ||
                coalesce("description", '') || ' ' ||
                coalesce("content", '')
            )
            WHERE "id" = ${blog.id}
        `;
    },
    { connection }
);