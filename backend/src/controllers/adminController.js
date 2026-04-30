import bcrypt from "bcryptjs";
import prisma from "../config/db.js";
import { findAdminByUsername } from "../services/adminService.js";
import { deleteRefreshTokensByUserId, saveRefreshToken } from "../services/authServices.js";
import { generateAccessToken, generateAdminToken, generateRefreshToken } from "../utils/jwt.js";

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
