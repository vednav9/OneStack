import dotenv from "dotenv";

dotenv.config();

export const env={
    port: process.env.PORT,
    dbUrl: process.env.DATABASE_URL,
    jwtSecret: process.env.JWT_SECRET,
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET
}