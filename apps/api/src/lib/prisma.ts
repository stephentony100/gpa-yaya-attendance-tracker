import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import { env } from "./env";

declare global {
  var __prisma: PrismaClient | undefined;
  var __pgPool: Pool | undefined;
}

const pool = globalThis.__pgPool ?? new Pool({ connectionString: env.RESOLVED_DATABASE_URL });

if (process.env.NODE_ENV !== "production") {
  globalThis.__pgPool = pool;
}

export const prisma =
  globalThis.__prisma ??
  new PrismaClient({
    adapter: new PrismaPg(pool),
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.__prisma = prisma;
}
