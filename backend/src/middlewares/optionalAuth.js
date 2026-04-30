import { verifyAccessToken } from "../utils/jwt.js";

export default function optionalAuth(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return next();
    }

    const token = authHeader.split(" ")[1];
    if (!token) return next();

    try {
        const decoded = verifyAccessToken(token);
        req.user = decoded;
    } catch {
        req.user = null;
    }

    return next();
}
