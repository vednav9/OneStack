import IORedis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

const redisUrl = process.env.REDIS_URL;

// Gracefully handle missing REDIS_URL instead of crashing the entire server.
// Services already wrap redis calls in try-catch, so a null export is safe.
if (!redisUrl) {
    console.warn("[redis] REDIS_URL is not set – Redis caching is disabled.");
}

let connection = null;

if (redisUrl) {
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
        lazyConnect: true, // Don't connect immediately – connect on first command
    };

    if (process.env.REDIS_USERNAME) {
        options.username = process.env.REDIS_USERNAME;
    }

    if (process.env.REDIS_PASSWORD) {
        options.password = process.env.REDIS_PASSWORD;
    }

    if (useTls) {
        options.tls = { minVersion: "TLSv1.2" };
    }

    connection = new IORedis(normalizedRedisUrl, options);

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
}

export default connection;
