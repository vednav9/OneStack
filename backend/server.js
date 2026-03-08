import express from "express";
import cors from "cors";

import { env } from "./src/config/env.js";
import logger from "./src/utils/logger.js";
import errorHandler from "./src/middlewares/errorHandler.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "API is running" });
});

app.use(errorHandler);

app.listen(env.port, () => {
  logger.info(`Server is running on ${env.port}`);
});
