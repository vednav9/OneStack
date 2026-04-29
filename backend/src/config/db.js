import pg from "pg";

let prisma = null;

try {
    // Dynamic import so a missing generated client doesn't crash the whole server.
    const { PrismaClient } = await import("../generated/prisma/index.js");
    const { PrismaPg } = await import("@prisma/adapter-pg");

    const { Pool } = pg;
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaPg(pool);

    prisma = new PrismaClient({ adapter });
} catch (err) {
    console.error("[db] Failed to initialize Prisma client:", err.message);
    console.error("[db] Hint: Ensure 'prisma generate' ran successfully during build and DATABASE_URL is set.");
}

export default prisma;