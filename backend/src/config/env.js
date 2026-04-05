import dotenv from "dotenv";

dotenv.config();

export const env={
    port: process.env.PORT,
    dbUrl: process.env.DATABASE_URL,
    jwtSecret: process.env.JWT_SECRET,
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
    frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
    openaiApiKey: process.env.OPENAI_API_KEY,
    openaiModel: process.env.OPENAI_MODEL || "gpt-4o-mini"
}