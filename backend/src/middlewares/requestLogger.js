import logger from "../utils/logger.js";

export default function requestLogger(req, res, next) {
    logger.info(`${req.method} ${req.url}`);
    next();
}