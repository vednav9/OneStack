import winston from "winston";

const logger = winston.createLogger({
    level: "info",
    format: winston.format.json(),
    transport: [
        new winston.transport.Console(),
    ],
});

export default logger;