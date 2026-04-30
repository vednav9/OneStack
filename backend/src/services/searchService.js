import prisma from "../config/db.js";

export async function searchBlogs(query) {
  const term = (query || "").trim();
  if (!term) return [];
  const likeTerm = `%${term}%`;
  const domainLike = term.includes(".") || term.startsWith("http://") || term.startsWith("https://");

  if (domainLike) {
    return prisma.$queryRaw`
      SELECT
        "id",
        "title",
        "description",
        "content",
        "sourceURL",
        "sourceSite",
        "author",
        "publishedAt",
        "readTime",
        "thumbnail",
        "createdAt"
      FROM "Blog"
      WHERE "deletedAt" IS NULL
        AND (
          "searchVector" @@ plainto_tsquery('english', ${term})
          OR "sourceURL" ILIKE ${likeTerm}
          OR "sourceSite" ILIKE ${likeTerm}
        )
      ORDER BY ts_rank("searchVector", plainto_tsquery('english', ${term})) DESC,
        "publishedAt" DESC NULLS LAST,
        "createdAt" DESC
      LIMIT 20
    `;
  }

  return prisma.$queryRaw`
      SELECT
        "id",
        "title",
        "description",
        "content",
        "sourceURL",
        "sourceSite",
        "author",
        "publishedAt",
        "readTime",
        "thumbnail",
        "createdAt"
      FROM "Blog"
      WHERE "deletedAt" IS NULL
        AND "searchVector" @@ plainto_tsquery('english', ${term})
      ORDER BY ts_rank("searchVector", plainto_tsquery('english', ${term})) DESC,
        "publishedAt" DESC NULLS LAST,
        "createdAt" DESC
      LIMIT 20
    `;
}