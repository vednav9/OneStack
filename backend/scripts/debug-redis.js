import connection from "../src/config/redis.js";

console.log("Checking Redis connection...");
console.log("Initial status:", connection.status);

connection.ping()
    .then((result) => {
        console.log("PING successful:", result);
        console.log("Redis is working!");
        process.exit(0);
    })
    .catch((err) => {
        console.error("PING failed:", err.message);
        console.error("Full error:", err);
        process.exit(1);
    });
