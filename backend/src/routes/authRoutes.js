import express from "express";
import passport from "passport";

import { register, login, refresh, logout } from "../controllers/authController.js";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt.js";
import { saveRefreshToken, deleteRefreshTokensByUserId } from "../services/authServices.js";
import { env } from "../config/env.js";

const router = express.Router();
const frontendUrl = (env.frontendUrl || "http://localhost:5173").replace(/\/$/, "");

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.post("/refresh", refresh);
router.get(
    "/google",
    passport.authenticate("google", {
        scope: ["profile", "email"],
    }),
);

router.get(
    "/google/callback",
    passport.authenticate("google", {
        session: false,
        failureRedirect: `${frontendUrl}/login?error=oauth_failed`,
    }),
    async (req, res) => {
        try {
            if (!req.user?.id) {
                return res.redirect(`${frontendUrl}/login?error=oauth_failed`);
            }

            const accessToken = generateAccessToken(req.user.id);
            const refreshToken = generateRefreshToken(req.user.id);

            await deleteRefreshTokensByUserId(req.user.id);
            await saveRefreshToken(req.user.id, refreshToken);

            const redirectUrl = `${frontendUrl}/auth#token=${encodeURIComponent(accessToken)}&refreshToken=${encodeURIComponent(refreshToken)}`;

            res.redirect(redirectUrl);
        } catch {
            res.redirect(`${frontendUrl}/login?error=oauth_failed`);
        }
    },
);

export default router;