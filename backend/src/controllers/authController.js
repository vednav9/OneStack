import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import {
    registerUser,
    findUserByEmail,
    saveRefreshToken,
    deleteRefreshToken,
    deleteRefreshTokensByUserId,
    findRefreshToken,
} from "../services/authServices.js";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeEmail(email = "") {
    return String(email).trim().toLowerCase();
}

export async function register(req, res) {
    try {
        const { email, name, password } = req.body;

        const normalizedEmail = normalizeEmail(email);
        const normalizedName = String(name || "").trim();

        if (!EMAIL_REGEX.test(normalizedEmail)) {
            return res.status(400).json({ error: "Invalid email format" });
        }
        if (normalizedEmail.length > 254) {
            return res.status(400).json({ error: "Email is too long" });
        }
        if (normalizedName.length < 2) {
            return res.status(400).json({ error: "Name must be at least 2 characters" });
        }
        if (normalizedName.length > 80) {
            return res.status(400).json({ error: "Name must be at most 80 characters" });
        }
        if (typeof password !== "string" || password.length < 8) {
            return res.status(400).json({ error: "Password must be at least 8 characters" });
        }
        if (password.length > 72) {
            return res.status(400).json({ error: "Password must be at most 72 characters" });
        }

        const existing = await findUserByEmail(normalizedEmail);
        if (existing) {
            return res.status(409).json({ error: "Email is already registered" });
        }

        const user = await registerUser({ email: normalizedEmail, password, name: normalizedName });

        const accessToken = generateAccessToken(user.id);
        const refreshToken = generateRefreshToken(user.id);

        await deleteRefreshTokensByUserId(user.id);
        await saveRefreshToken(user.id, refreshToken);

        res.status(201).json({
            accessToken,
            refreshToken,
        });
    } catch (err) {
        res.status(500).json({ error: "Failed to register user" });
    }
}

export async function login(req, res) {
    try {
        const { email, password } = req.body;

        const normalizedEmail = normalizeEmail(email);

        if (!EMAIL_REGEX.test(normalizedEmail) || typeof password !== "string" || password.length === 0) {
            return res.status(400).json({ error: "Email and password are required" });
        }
        if (normalizedEmail.length > 254) {
            return res.status(400).json({ error: "Invalid credentials" });
        }

        const user = await findUserByEmail(normalizedEmail);
        if (!user) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        if (!user.password) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const accessToken = generateAccessToken(user.id);
        const refreshToken = generateRefreshToken(user.id);

        await deleteRefreshTokensByUserId(user.id);
        await saveRefreshToken(user.id, refreshToken);

        res.json({
            accessToken,
            refreshToken,
        });
    } catch (err) {
        res.status(500).json({ error: "Failed to login" });
    }
}

export async function logout(req, res) {
    try {
        const { refreshToken } = req.body || {};

        if (refreshToken && (typeof refreshToken !== "string" || refreshToken.length < 20 || refreshToken.split(".").length !== 3)) {
            return res.status(400).json({ error: "Invalid token" });
        }

        if (refreshToken) {
            await deleteRefreshToken(refreshToken);
        }

        res.json({ message: "Logged out" });
    } catch {
        res.status(500).json({ error: "Failed to logout" });
    }
}

export async function refresh(req, res) {
    const { refreshToken } = req.body || {};

    if (!refreshToken || typeof refreshToken !== "string" || refreshToken.length < 20 || refreshToken.split(".").length !== 3) {
        return res.status(400).json({ error: "Missing token" });
    }

    try {
        const storedToken = await findRefreshToken(refreshToken);

        if (!storedToken) {
            return res.status(403).json({ error: "Invalid token" });
        }

        const decoded = jwt.verify(refreshToken, process.env.jwtRefreshSecret);

        if (storedToken.userId !== decoded.userId) {
            return res.status(403).json({ error: "Invalid token" });
        }

        const accessToken = generateAccessToken(decoded.userId);
        const newRefreshToken = generateRefreshToken(decoded.userId);

        await deleteRefreshToken(refreshToken);
        await saveRefreshToken(decoded.userId, newRefreshToken);

        res.json({ accessToken, refreshToken: newRefreshToken });
    } catch {
        return res.status(403).json({ error: "Invalid or expired token" });
    }
}
