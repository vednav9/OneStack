import bcrypt from "bcryptjs";
import prisma from "../config/db.js";
import { findAdminByUsername } from "../services/adminService.js";
import { deleteRefreshTokensByUserId, saveRefreshToken } from "../services/authServices.js";
import { generateAccessToken, generateAdminToken, generateRefreshToken } from "../utils/jwt.js";

const MS_IN_DAY = 24 * 60 * 60 * 1000;

function percentChange(current, previous) {
  if (!previous) {
    return current ? "+100%" : "0%";
  }
  const diff = ((current - previous) / previous) * 100;
  const rounded = Math.round(diff);
  return `${rounded >= 0 ? "+" : ""}${rounded}%`;
}

export async function adminLogin(req, res) {
  try {
    const { username, password } = req.body || {};

    if (typeof username !== "string" || typeof password !== "string") {
      return res.status(400).json({ error: "Username and password are required" });
    }

    const admin = await findAdminByUsername(username);
    if (!admin) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const valid = await bcrypt.compare(password, admin.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    if (!admin.userId) {
      return res.status(401).json({ error: "Admin user not linked" });
    }

    const user = await prisma.user.findUnique({
      where: { id: admin.userId },
      select: { role: true },
    });

    if (!user || user.role !== "ADMIN") {
      return res.status(403).json({ error: "Admin access required" });
    }

    const adminAccessToken = generateAdminToken(admin.id);
    const accessToken = generateAccessToken(admin.userId);
    const refreshToken = generateRefreshToken(admin.userId);

    await deleteRefreshTokensByUserId(admin.userId);
    await saveRefreshToken(admin.userId, refreshToken);

    return res.json({ adminAccessToken, accessToken, refreshToken });
  } catch {
    return res.status(500).json({ error: "Failed to login" });
  }
}

export async function verifyAdmin(req, res) {
  return res.json({ ok: true });
}

export async function getAdminDashboard(req, res) {
  try {
    const now = new Date();
    const weekStart = new Date(now.getTime() - 7 * MS_IN_DAY);
    const prevWeekStart = new Date(now.getTime() - 14 * MS_IN_DAY);

    const [
      totalUsers,
      usersLastWeek,
      usersPrevWeek,
      totalBlogs,
      blogsLastWeek,
      blogsPrevWeek,
      syncErrorsLastWeek,
      syncErrorsPrevWeek,
      recentBlogs,
      recentComments,
      recentUsers,
      recentReads,
      activeReadersLast,
      activeReadersPrev,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { createdAt: { gte: weekStart } } }),
      prisma.user.count({ where: { createdAt: { gte: prevWeekStart, lt: weekStart } } }),
      prisma.blog.count({ where: { deletedAt: null } }),
      prisma.blog.count({ where: { deletedAt: null, createdAt: { gte: weekStart } } }),
      prisma.blog.count({ where: { deletedAt: null, createdAt: { gte: prevWeekStart, lt: weekStart } } }),
      prisma.blog.count({ where: { deletedAt: null, content: null, createdAt: { gte: weekStart } } }),
      prisma.blog.count({ where: { deletedAt: null, content: null, createdAt: { gte: prevWeekStart, lt: weekStart } } }),
      prisma.blog.findMany({
        where: { deletedAt: null },
        orderBy: { createdAt: "desc" },
        take: 6,
        select: { id: true, title: true, sourceSite: true, createdAt: true },
      }),
      prisma.comment.findMany({
        orderBy: { createdAt: "desc" },
        take: 6,
        select: { id: true, createdAt: true, blog: { select: { title: true } } },
      }),
      prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        take: 6,
        select: { id: true, email: true, name: true, createdAt: true },
      }),
      prisma.readingHistory.findMany({
        orderBy: { readAt: "desc" },
        take: 6,
        select: { id: true, readAt: true, blog: { select: { title: true } } },
      }),
      prisma.readingHistory.findMany({
        where: { readAt: { gte: weekStart }, blog: { deletedAt: null } },
        distinct: ["userId"],
        select: { userId: true },
      }),
      prisma.readingHistory.findMany({
        where: { readAt: { gte: prevWeekStart, lt: weekStart }, blog: { deletedAt: null } },
        distinct: ["userId"],
        select: { userId: true },
      }),
    ]);

    const stats = [
      {
        key: "totalUsers",
        title: "Total Users",
        value: totalUsers,
        change: percentChange(usersLastWeek, usersPrevWeek),
      },
      {
        key: "blogsIndexed",
        title: "Blogs Indexed",
        value: totalBlogs,
        change: percentChange(blogsLastWeek, blogsPrevWeek),
      },
      {
        key: "activeReaders",
        title: "Active Readers",
        value: activeReadersLast.length,
        change: percentChange(activeReadersLast.length, activeReadersPrev.length),
      },
      {
        key: "syncErrors",
        title: "Sync Errors",
        value: syncErrorsLastWeek,
        change: percentChange(syncErrorsLastWeek, syncErrorsPrevWeek),
        critical: syncErrorsLastWeek > 0,
      },
    ];

    const activity = [];

    recentBlogs.forEach((blog) => {
      activity.push({
        id: `blog-${blog.id}`,
        type: "success",
        message: `Indexed ${blog.title || "a new blog"}`,
        timestamp: blog.createdAt,
      });
    });

    recentComments.forEach((comment) => {
      activity.push({
        id: `comment-${comment.id}`,
        type: "info",
        message: `New comment on ${comment.blog?.title || "a blog"}`,
        timestamp: comment.createdAt,
      });
    });

    recentUsers.forEach((user) => {
      const label = user.name || user.email || "New user";
      activity.push({
        id: `user-${user.id}`,
        type: "success",
        message: `New user joined: ${label}`,
        timestamp: user.createdAt,
      });
    });

    recentReads.forEach((record) => {
      activity.push({
        id: `read-${record.id}`,
        type: "info",
        message: `Article read: ${record.blog?.title || "a blog"}`,
        timestamp: record.readAt,
      });
    });

    activity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return res.json({
      stats,
      activity: activity.slice(0, 10),
      system: { healthy: syncErrorsLastWeek === 0 },
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Failed to load admin dashboard" });
  }
}
