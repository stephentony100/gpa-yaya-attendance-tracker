import { randomUUID } from "node:crypto";

// Force test-DB routing before prisma.ts (via env.ts) resolves a connection
// string — this script must never be able to write to the production DB,
// regardless of how NODE_ENV is set in the invoking shell.
process.env.NODE_ENV = "test";

async function main() {
  const { prisma } = await import("../src/lib/prisma");

  const runId = randomUUID();

  const admin = await prisma.admin.create({
    data: {
      name: "Test Admin",
      email: `test-${runId}@example.com`,
      passwordHash: "x",
    },
  });

  const eventType = await prisma.eventType.create({
    data: { name: "Sunday School", isRecurring: false },
  });

  const today = new Date();
  const expiresAt = new Date(today);
  expiresAt.setHours(23, 59, 59, 999);

  const session = await prisma.session.create({
    data: {
      eventTypeId: eventType.id,
      date: today,
      qrToken: `test-token-${runId}`,
      expiresAt,
      createdById: admin.id,
    },
  });

  const expiredSession = await prisma.session.create({
    data: {
      eventTypeId: eventType.id,
      date: today,
      qrToken: `expired-token-${runId}`,
      expiresAt: new Date(Date.now() - 1000),
      createdById: admin.id,
    },
  });

  console.log(JSON.stringify({ session, expiredSession }, null, 2));

  return prisma;
}

main().then((prisma) => prisma.$disconnect());
