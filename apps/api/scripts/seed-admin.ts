import bcrypt from "bcrypt";
import { prisma } from "../src/lib/prisma";

const DEFAULT_ADMIN = {
  name: "YAYA Admin",
  email: "admin@gpa-yaya.com",
  password: "changeme123",
};

async function main() {
  const existing = await prisma.admin.findFirst();
  if (existing) {
    console.log(`Admin already exists (${existing.email}) — skipping seed.`);
    return;
  }

  const passwordHash = await bcrypt.hash(DEFAULT_ADMIN.password, 10);
  const admin = await prisma.admin.create({
    data: {
      name: DEFAULT_ADMIN.name,
      email: DEFAULT_ADMIN.email,
      passwordHash,
    },
  });

  console.log(`Created default admin: ${admin.email} / ${DEFAULT_ADMIN.password}`);
  console.log("Change this password after first login.");
}

main().finally(() => prisma.$disconnect());
