import dotenv from "dotenv";

dotenv.config({
  path: ".env",
});

export const env = {
    DATABASE_URL: process.env.DATABASE_URL!,
    GOOGLE_API_KEY: process.env.GOOGLE_API_KEY!,
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: process.env.PORT || '3001',
};