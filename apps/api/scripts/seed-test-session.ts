import { randomUUID } from "node:crypto";
import { prisma } from "../src/lib/prisma";

async function main() {
  const admin = await prisma.admin.create({
    data: {
      name: "Test Admin",
      email: `test-${randomUUID()}@example.com`,
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
      qrToken: "test-token-123",
      expiresAt,
      createdById: admin.id,
    },
  });

  const expiredSession = await prisma.session.create({
    data: {
      eventTypeId: eventType.id,
      date: today,
      qrToken: "expired-token-456",
      expiresAt: new Date(Date.now() - 1000),
      createdById: admin.id,
    },
  });

  console.log(JSON.stringify({ session, expiredSession }, null, 2));
}

main().finally(() => prisma.$disconnect());
