import IORedis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
    throw new Error("REDIS_URL is not set");
}

const options = {
    maxRetriesPerRequest: null,
    retryStrategy: () => null,
    reconnectOnError: () => false,
};

// Allow explicit overrides while still using URL auth by default.
if (process.env.REDIS_USERNAME) {
    options.username = process.env.REDIS_USERNAME;
}

if (process.env.REDIS_PASSWORD) {
    options.password = process.env.REDIS_PASSWORD;
}

if (process.env.REDIS_TLS === "true") {
    options.tls = {};
}

const connection = new IORedis(redisUrl, options);

connection.on("error", (error) => {
    if (error?.message?.includes("WRONGPASS")) {
        console.error(
            "Redis auth failed (WRONGPASS). Verify REDIS_URL / REDIS_PASSWORD / REDIS_USERNAME credentials."
        );
    }
});

export default connection;
