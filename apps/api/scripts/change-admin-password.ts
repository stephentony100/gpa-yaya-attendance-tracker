import bcrypt from "bcrypt";
import { prisma } from "../src/lib/prisma";

function parseArgs(argv: string[]): { email?: string; password?: string } {
  const result: { email?: string; password?: string } = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--email") result.email = argv[i + 1];
    if (argv[i] === "--password") result.password = argv[i + 1];
  }
  return result;
}

async function main() {
  const { email, password } = parseArgs(process.argv.slice(2));

  if (!email || !password) {
    console.error("Usage: npm run change-admin-password -- --email <email> --password <password>");
    process.exitCode = 1;
    return;
  }

  const admin = await prisma.admin.findUnique({ where: { email } });
  if (!admin) {
    console.error(`No admin found with email: ${email}`);
    process.exitCode = 1;
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.admin.update({ where: { email }, data: { passwordHash } });

  console.log(`Password updated for ${email}.`);
}

main().finally(() => prisma.$disconnect());
