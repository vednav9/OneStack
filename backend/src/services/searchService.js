import prisma from "../config/db.js";

export async function searchBlogs(query) {

  return prisma.$queryRawUnsafe(`
    SELECT * FROM "Blog"
    WHERE "searchVector" @@ plainto_tsquery('english', $1)
    ORDER BY ts_rank("searchVector", plainto_tsquery('english', $1)) DESC
    LIMIT 20
  `, query);

}