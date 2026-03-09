import express from "express";
import passport from "passport";

import { register, login, refresh, logout } from "../controllers/authController.js";
import { generateAccessToken } from "../utils/jwt.js";

const router = express.Router();

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
    passport.authenticate("google", { session: false }),
    (req, res) => {
        const token = generateAccessToken(req.user.id);
        res.redirect(`http://localhost:5173/auth?token=${token}`);
    },
);

export default router;