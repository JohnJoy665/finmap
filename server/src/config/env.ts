import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

function getEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing env variable: ${name}`);
  }

  return value;
}

export const env = {
  PORT: Number(process.env.PORT) || 5000,

  DB_HOST: getEnv("DB_HOST"),
  DB_PORT: Number(getEnv("DB_PORT")),
  DB_NAME: getEnv("DB_NAME"),
  DB_USER: getEnv("DB_USER"),
  DB_PASSWORD: getEnv("DB_PASSWORD"),
  JWT_SECRET: getEnv("JWT_SECRET"),
};