import IORedis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
    throw new Error("REDIS_URL is not set");
}

const tlsEnv = (process.env.REDIS_TLS || "auto").toLowerCase();
const isRedissUrl = redisUrl.startsWith("rediss://");

let useTls = isRedissUrl;
if (tlsEnv === "true") useTls = true;
if (tlsEnv === "false") useTls = false;

const normalizedRedisUrl = useTls
    ? redisUrl.replace(/^redis:\/\//, "rediss://")
    : redisUrl.replace(/^rediss:\/\//, "redis://");

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

if (useTls) {
    options.tls = { minVersion: "TLSv1.2" };
}

const connection = new IORedis(normalizedRedisUrl, options);

connection.on("error", (error) => {
    if (error?.message?.includes("WRONGPASS")) {
        console.error(
            "Redis auth failed (WRONGPASS). Verify REDIS_URL / REDIS_PASSWORD / REDIS_USERNAME credentials."
        );
    }

    if (error?.code === "ERR_SSL_WRONG_VERSION_NUMBER") {
        console.error(
            `Redis TLS mismatch. Using URL ${normalizedRedisUrl}. Check REDIS_TLS and URL scheme (redis:// vs rediss://).`
        );
    }
});

export default connection;
