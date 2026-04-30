import prisma from "../config/db.js";

export default async function adminOnly(req, res, next) {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user || user.role !== "ADMIN") {
      return res.status(403).json({ error: "Forbidden" });
    }

    return next();
  } catch (err) {
    return res.status(500).json({ error: err.message || "Authorization failed" });
  }
}
