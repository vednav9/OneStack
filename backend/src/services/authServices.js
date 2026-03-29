import bcrypt from "bcryptjs";

import prisma from "../config/db.js";

export async function registerUser(data) {
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
        data: {
            email: data.email,
            name: data.name,
            password: hashedPassword,
        },
    });

    return user;
}

export async function findUserByEmail(email) {
    return prisma.user.findUnique({
        where: { email },
    });
}

export async function saveRefreshToken(userId, token) {
    await prisma.refreshToken.create({
        data: {
            token,
            userId,
        },
    });
}

export async function deleteRefreshToken(refreshToken) {
    await prisma.refreshToken.delete({
        where: { token: refreshToken },
    });
}

export async function findRefreshToken(refreshToken) {
    return await prisma.refreshToken.findUnique({
        where: { token: refreshToken },
    });
}
