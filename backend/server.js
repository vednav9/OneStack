import express from "express";
import cors from "cors";
import passport from "passport";
import { env } from "./src/config/env.js";

import logger from "./src/utils/logger.js";
import errorHandler from "./src/middlewares/errorHandler.js";
import requestLogger from "./src/middlewares/requestLogger.js";
import routes from "./src/routes/index.js";
import authRoutes from "./src/routes/authRoutes.js";
import userRoutes from "./src/routes/userRoutes.js";
import blogRoutes from "./src/routes/blogRoutes.js";
import searchRoutes from "./src/routes/searchRoutes.js";
import recommendationRoutes from "./src/routes/recommendationRoutes.js";
import tagRoutes from "./src/routes/tagRoutes.js";
import listRoutes from "./src/routes/listRoutes.js";
import "./src/config/googleStrategy.js";

const enableJobs = process.env.ENABLE_JOBS === "true";
if (enableJobs && !process.env.VERCEL) {
    try {
        await import("./src/jobs/blogParser.js");
        await import("./src/jobs/scheduler.js");
    } catch (err) {
        console.error("[startup] Failed to load background jobs:", err.message);
    }
}

const app = express();

const normalizeOrigin = (origin) => origin.trim().replace(/\/$/, "");

const allowedOrigins = (env.frontendUrl || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean)
  .map(normalizeOrigin);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const normalizedOrigin = normalizeOrigin(origin);
    return callback(null, allowedOrigins.includes(normalizedOrigin));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

app.use(express.json());
app.use(requestLogger);
app.use(passport.initialize());

// Silence favicon requests from crawlers (e.g. Vercel's vercel-favicon/1.0)
app.get("/favicon.ico", (req, res) => res.status(204).end());
app.get("/favicon.png", (req, res) => res.status(204).end());

app.get("/", (req, res) => {
    res.json({ message: "API is running" });
});

app.use("/api", routes);
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/recommendation", recommendationRoutes);
app.use("/api/tags", tagRoutes);
app.use("/api/lists", listRoutes);

app.use(errorHandler);

if (process.env.NODE_ENV !== "production") {
    app.listen(env.port, () => {
        logger.info(`Server is running on ${env.port}`);
    });
}

export default app;