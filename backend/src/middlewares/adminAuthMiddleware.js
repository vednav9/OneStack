import { verifyAdminToken } from "../utils/jwt.js";

export default function adminAuthMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const decoded = verifyAdminToken(token);
    req.admin = decoded;
    return next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}
