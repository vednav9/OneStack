import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import prisma from "../src/config/db.js";

dotenv.config();

async function main() {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;
  const email = process.env.ADMIN_EMAIL;
  const displayName = process.env.ADMIN_NAME || "Admin";

  if (!username || !password) {
    console.error("ADMIN_USERNAME and ADMIN_PASSWORD must be set in the environment.");
    process.exit(1);
  }

  const normalizedUsername = username.trim().toLowerCase();
  const normalizedEmail = (email || `${normalizedUsername}@onestack.admin`).trim().toLowerCase();

  const user = await prisma.user.upsert({
    where: { email: normalizedEmail },
    update: { role: "ADMIN", name: displayName },
    create: {
      email: normalizedEmail,
      name: displayName,
      role: "ADMIN",
    },
  });

  const existing = await prisma.adminUser.findUnique({
    where: { username: normalizedUsername },
  });

  const passwordHash = await bcrypt.hash(password, 12);
  if (existing) {
    await prisma.adminUser.update({
      where: { username: normalizedUsername },
      data: {
        passwordHash,
        userId: user.id,
      },
    });
    console.log("Admin user updated.");
    return;
  }

  await prisma.adminUser.create({
    data: {
      username: normalizedUsername,
      passwordHash,
      userId: user.id,
    },
  });

  console.log("Admin user created.");
}

main()
  .catch((err) => {
    console.error("Failed to create admin user:", err.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
