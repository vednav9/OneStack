import winston from "winston";

const logger = winston.createLogger({
    level: "info",
    format: winston.format.json(),
    transport: [
        new winston.transports.Console(),
    ],
});

export default logger;