import prisma from "../config/db.js";

const DEFAULT_LIMIT = 5;
const MAX_LIMIT = 20;

function formatSourceName(sourceSite) {
    if (!sourceSite) return "Unknown";
    const withoutWww = sourceSite.replace(/^www\./i, "");
    const host = withoutWww.split("/")[0];
    const main = host.split(".")[0] || host;
    const label = main
        .split(/[-_]/g)
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
    return label || host;
}

export async function getSources(req, res) {
    try {
        const requested = Number(req.query.limit) || DEFAULT_LIMIT;
        const limit = Math.min(Math.max(requested, 1), MAX_LIMIT);

        const grouped = await prisma.blog.groupBy({
            by: ["sourceSite"],
            _count: { sourceSite: true },
            orderBy: { _count: { sourceSite: "desc" } },
            take: limit,
        });

        const sources = grouped
            .filter((row) => row.sourceSite)
            .map((row) => ({
                id: row.sourceSite,
                name: formatSourceName(row.sourceSite),
                sourceSite: row.sourceSite,
                count: row._count.sourceSite,
            }));

        res.json(sources);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
