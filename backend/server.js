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
import "./src/config/googleStrategy.js";
import "./src/jobs/blogParser.js";
import "./src/jobs/scheduler.js";

const app = express();

app.use(cors());
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

app.use(errorHandler);

app.listen(env.port, () => {
    logger.info(`Server is running on ${env.port}`);
});
