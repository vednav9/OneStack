import bcrypt from "bcryptjs";

import { registerUser, findUserByEmail } from "../services/authServices.js";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt.js";

export async function register(req, res) {
    try {
        const { email, name, password } = req.body;

        const user = await registerUser({ email, password, name });

        const accessToken = generateAccessToken(user.id);
        const refreshToken = generateRefreshToken(user.id);

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

        res.json({
            accessToken,
            refreshToken,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
