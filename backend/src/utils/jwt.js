import jwt from "jsonwebtoken";
import crypto from "crypto";

export function generateAccessToken(userId) {
    return jwt.sign(
        {userId},
        process.env.jwtSecret,
        {expiresIn:"15m"}
    );
}

export function generateRefreshToken(userId) {
    return jwt.sign(
        { userId, jti: crypto.randomUUID() },
        process.env.jwtRefreshSecret,
        {expiresIn:"7d"}
    );
}

export function verifyAccessToken(token){
    return jwt.verify(token, process.env.jwtSecret);
}