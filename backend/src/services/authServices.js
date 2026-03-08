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