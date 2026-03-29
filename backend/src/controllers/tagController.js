import prisma from "../config/db.js";

export async function getTags(req, res) {
    try {
        const tags = await prisma.tag.findMany({
            orderBy: {
                blogs: {
                    _count: "desc",
                },
            },
            take: 50,
        });
        res.json(tags.map(t => t.name));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
