import jwt from "../utils/jwt.js";

export default function authMiddleware(req, res, next) {
    const authHeader = req.header.authorization;
    if (!authHeader) {
        return res.json({ error: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];
    try {
        const decoded = verifyAccessToken(token);
        req.user = decoded;
        next();
    } catch {
        res.status(401).json({ error: "Invalid token" });
    }
}
