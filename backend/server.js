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
import "./src/jobs/blogParser.js";
import "./src/jobs/scheduler.js";

const app = express();

const allowedOrigins = (env.frontendUrl || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

app.use(cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));

// Must be BEFORE routes — responds 200 to all preflight OPTIONS requests
app.options("*", cors());

app.use(express.json());
app.use(requestLogger);
app.use(passport.initialize());

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