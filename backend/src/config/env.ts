import dotenv from "dotenv";

dotenv.config();

function requiredEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is not configured`);
  }

  return value;
}

export const env = {
  databaseUrl: requiredEnv("DATABASE_URL"),
  birtEnginePath: requiredEnv("BIRT_ENGINE_PATH"),
  birtReportsPath: requiredEnv("BIRT_REPORTS_PATH"),
};
