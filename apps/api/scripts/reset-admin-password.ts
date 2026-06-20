import { randomBytes } from "node:crypto";
import bcrypt from "bcrypt";
import { prisma } from "../src/lib/prisma";

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error("Usage: tsx scripts/reset-admin-password.ts <email>");
    process.exitCode = 1;
    return;
  }

  const admin = await prisma.admin.findUnique({ where: { email } });
  if (!admin) {
    console.error(`No admin found with email ${email}`);
    process.exitCode = 1;
    return;
  }

  const password = randomBytes(18).toString("base64url");
  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.admin.update({ where: { id: admin.id }, data: { passwordHash } });

  console.log(`Password reset for ${admin.email}: ${password}`);
  console.log("This password is shown once — store it now.");
}

main().finally(() => prisma.$disconnect());
