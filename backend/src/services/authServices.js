import bcrypt from "bcryptjs";
import crypto from "crypto";

import prisma from "../config/db.js";

function hashRefreshToken(token) {
    return crypto.createHash("sha256").update(String(token)).digest("hex");
}

export async function registerUser(data) {
    const hashedPassword = await bcrypt.hash(data.password, 12);
    const normalizedEmail = data.email.trim().toLowerCase();

    const user = await prisma.user.create({
        data: {
            email: normalizedEmail,
            name: data.name,
            password: hashedPassword,
        },
    });

    return user;
}

export async function findUserByEmail(email) {
    const normalizedEmail = email.trim().toLowerCase();
    return prisma.user.findUnique({
        where: { email: normalizedEmail },
    });
}

export async function saveRefreshToken(userId, token) {
    const hashedToken = hashRefreshToken(token);

    await prisma.refreshToken.create({
        data: {
            token: hashedToken,
            userId,
        },
    });
}

export async function deleteRefreshToken(refreshToken) {
    const hashedToken = hashRefreshToken(refreshToken);

    await prisma.refreshToken.deleteMany({
        where: {
            OR: [
                { token: hashedToken },
                // Backward compatibility for older plaintext tokens.
                { token: refreshToken },
            ],
        },
    });
}

export async function deleteRefreshTokensByUserId(userId) {
    await prisma.refreshToken.deleteMany({
        where: { userId },
    });
}

export async function findRefreshToken(refreshToken) {
    const hashedToken = hashRefreshToken(refreshToken);

    return prisma.refreshToken.findFirst({
        where: {
            OR: [
                { token: hashedToken },
                // Backward compatibility for older plaintext tokens.
                { token: refreshToken },
            ],
        },
    });
}
