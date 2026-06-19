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

function loadEnv(): Record<RequiredVar, string> {
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

  return values;
}

export const env = loadEnv();
