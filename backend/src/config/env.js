import dotenv from "dotenv";

dotenv.config();

export const env={
    port: process.env.PORT,
    dbUrl: process.env.DATABASE_URL,
    jwtSecret: process.env.JWT_SECRET,
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
    adminJwtSecret: process.env.ADMIN_JWT_SECRET || process.env.JWT_SECRET,
    frontendUrl: process.env.FRONTEND_URL,
    googleCallbackUrl: process.env.GOOGLE_CALLBACK_URL,
    geminiApiKey: process.env.GEMINI_API_KEY,
    geminiModel: process.env.GEMINI_MODEL || "gemini-2.0-flash",
    r2AccountId: process.env.R2_ACCOUNT_ID,
    r2AccessKeyId: process.env.R2_ACCESS_KEY_ID,
    r2SecretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    r2Bucket: process.env.R2_BUCKET,
    r2PublicBaseUrl: process.env.R2_PUBLIC_BASE_URL
}