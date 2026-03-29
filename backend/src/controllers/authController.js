import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import {
    registerUser,
    findUserByEmail,
    saveRefreshToken,
    deleteRefreshToken,
    findRefreshToken,
} from "../services/authServices.js";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt.js";
import prisma from "../config/db.js";

export async function register(req, res) {
    try {
        const { email, name, password } = req.body;

        const user = await registerUser({ email, password, name });

        const accessToken = generateAccessToken(user.id);
        const refreshToken = generateRefreshToken(user.id);

        await saveRefreshToken(user.id, refreshToken);

        res.json({
            accessToken,
            refreshToken,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

export async function login(req, res) {
    try {
        const { email, password } = req.body;

        const user = await findUserByEmail(email);
        if (!user) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const accessToken = generateAccessToken(user.id);
        const refreshToken = generateRefreshToken(user.id);

        await saveRefreshToken(user.id, refreshToken);

        res.json({
            accessToken,
            refreshToken,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

export async function logout(req, res) {
    const { refreshToken } = req.body;

    if (refreshToken) {
        await deleteRefreshToken(refreshToken);
    }

    res.json({ message: "Logged out" });
}

export async function refresh(req, res) {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(400).json({ error: "Missing token" });
    }

    try {
        const storedToken = await findRefreshToken(refreshToken);

        if (!storedToken) {
            return res.status(403).json({ error: "Invalid token" });
        }

        const decoded = jwt.verify(
            refreshToken,
            process.env.JWT_REFRESH_SECRET,
        );

        const accessToken = generateAccessToken(decoded.userId);

        res.json({ accessToken });
    } catch (err) {
        return res.status(403).json({ error: "Invalid or expired token" });
    }
}
