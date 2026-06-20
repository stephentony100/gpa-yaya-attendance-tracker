import "dotenv/config";

const REQUIRED_VARS = [
  "DATABASE_URL",
  "DIRECT_URL",
  "JWT_SECRET",
  "JWT_EXPIRES_IN",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
  "PORT",
  "NODE_ENV",
  "FRONTEND_URL",
] as const;

type RequiredVar = (typeof REQUIRED_VARS)[number];

interface Env extends Record<RequiredVar, string> {
  TEST_DATABASE_URL?: string;
  // The connection string the app should actually use: TEST_DATABASE_URL
  // when NODE_ENV=test, DATABASE_URL otherwise. Never falls back silently.
  RESOLVED_DATABASE_URL: string;
}

function loadEnv(): Env {
  const missing: string[] = [];
  const values = {} as Record<RequiredVar, string>;

  for (const key of REQUIRED_VARS) {
    const value = process.env[key];
    if (!value) {
      missing.push(key);
    } else {
      values[key] = value;
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variable(s): ${missing.join(", ")}`
    );
  }

  let resolvedDatabaseUrl = values.DATABASE_URL;

  if (values.NODE_ENV === "test") {
    if (!process.env.TEST_DATABASE_URL) {
      throw new Error(
        "NODE_ENV=test but TEST_DATABASE_URL is not set. Refusing to fall back to the " +
          "production DATABASE_URL — set TEST_DATABASE_URL to a dedicated test database " +
          "before running tests or test/seed scripts."
      );
    }
    resolvedDatabaseUrl = process.env.TEST_DATABASE_URL;
  }

  return {
    ...values,
    TEST_DATABASE_URL: process.env.TEST_DATABASE_URL,
    RESOLVED_DATABASE_URL: resolvedDatabaseUrl,
  };
}

export const env = loadEnv();
