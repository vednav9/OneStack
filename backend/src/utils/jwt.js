import jwt from "jsonwebtoken";
import crypto from "crypto";
import { env } from "../config/env.js";

export function generateAccessToken(userId) {
    return jwt.sign(
        {userId},
        env.jwtSecret,
        {expiresIn:"15m"}
    );
}

export function generateRefreshToken(userId) {
    return jwt.sign(
        { userId, jti: crypto.randomUUID() },
        env.jwtRefreshSecret,
        {expiresIn:"7d"}
    );
}

export function verifyAccessToken(token){
    return jwt.verify(token, env.jwtSecret);
}