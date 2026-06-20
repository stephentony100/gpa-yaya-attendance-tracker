import { randomBytes } from "node:crypto";
import bcrypt from "bcrypt";
import { prisma } from "../src/lib/prisma";

const DEFAULT_ADMIN = {
  name: "GPA YAYA Admin",
  email: "admin@gpa-yaya.com",
};

async function main() {
  const existing = await prisma.admin.findFirst();
  if (existing) {
    console.log(`Admin already exists (${existing.email}) — skipping seed.`);
    return;
  }

  const password = randomBytes(18).toString("base64url");
  const passwordHash = await bcrypt.hash(password, 10);
  const admin = await prisma.admin.create({
    data: {
      name: DEFAULT_ADMIN.name,
      email: DEFAULT_ADMIN.email,
      passwordHash,
    },
  });

  console.log(`Created default admin: ${admin.email} / ${password}`);
  console.log("This password is shown once — store it now. Change it after first login.");
}

main().finally(() => prisma.$disconnect());
