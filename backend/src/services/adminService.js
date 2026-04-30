import bcrypt from "bcryptjs";
import prisma from "../config/db.js";

function normalizeUsername(username = "") {
  return String(username).trim().toLowerCase();
}

export async function findAdminByUsername(username) {
  const normalizedUsername = normalizeUsername(username);
  if (!normalizedUsername) return null;
  return prisma.adminUser.findUnique({
    where: { username: normalizedUsername },
  });
}

export async function createAdminUser({ username, password, userId }) {
  const normalizedUsername = normalizeUsername(username);
  if (!normalizedUsername) {
    throw new Error("Username is required");
  }
  if (!userId) {
    throw new Error("User id is required");
  }
  if (typeof password !== "string" || password.length < 6) {
    throw new Error("Password must be at least 6 characters");
  }

  const passwordHash = await bcrypt.hash(password, 12);
  return prisma.adminUser.create({
    data: {
      username: normalizedUsername,
      passwordHash,
      userId,
    },
  });
}
