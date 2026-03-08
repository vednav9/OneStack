import logger from '../utils/logger';

export default function errorHandler(err, req, res, next) {
    logger.error(err.message);
    res.status(500).json({
        error:"Internal server error",
    });
}