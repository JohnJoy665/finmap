import dotenv from "dotenv";

const envFile = process.env.NODE_ENV === "production" ? ".env" : ".env.local";

dotenv.config({ path: envFile });

function getEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing env variable: ${name}`);
  }

  return value;
}

export const env = {
  NODE_ENV: process.env.NODE_ENV || "development",

  PORT: Number(process.env.PORT) || 5000,

  DB_HOST: getEnv("DB_HOST"),
  DB_PORT: Number(getEnv("DB_PORT")),
  DB_NAME: getEnv("DB_NAME"),
  DB_USER: getEnv("DB_USER"),
  DB_PASSWORD: getEnv("DB_PASSWORD"),
  JWT_SECRET: getEnv("JWT_SECRET"),
};
