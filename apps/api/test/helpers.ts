import { randomUUID } from "node:crypto";
import bcrypt from "bcrypt";
import { prisma } from "../src/lib/prisma";

export async function createTestAdmin() {
  return prisma.admin.create({
    data: {
      name: "Vitest Admin",
      email: `vitest-${randomUUID()}@example.com`,
      passwordHash: await bcrypt.hash("vitest-password-123", 10),
    },
  });
}

export async function createTestEventType() {
  return prisma.eventType.create({
    data: { name: `Vitest Event ${randomUUID()}`, isRecurring: false },
  });
}

export async function createTestSession(opts: {
  eventTypeId: string;
  createdById: string;
  expiresAt: Date;
  closedAt?: Date | null;
}) {
  return prisma.session.create({
    data: {
      eventTypeId: opts.eventTypeId,
      date: new Date(),
      qrToken: `vitest-${randomUUID()}`,
      expiresAt: opts.expiresAt,
      closedAt: opts.closedAt ?? null,
      createdById: opts.createdById,
    },
  });
}

export function testPhoneNumber(): string {
  const digits = Math.floor(Math.random() * 1_000_000_000)
    .toString()
    .padStart(9, "0");
  return `+234${digits}`;
}

export async function cleanupTestData(ids: {
  sessionIds?: string[];
  memberIds?: string[];
  eventTypeIds?: string[];
  adminIds?: string[];
}) {
  if (ids.sessionIds?.length) {
    await prisma.attendance.deleteMany({ where: { sessionId: { in: ids.sessionIds } } });
    await prisma.session.deleteMany({ where: { id: { in: ids.sessionIds } } });
  }
  if (ids.memberIds?.length) {
    await prisma.member.deleteMany({ where: { id: { in: ids.memberIds } } });
  }
  if (ids.eventTypeIds?.length) {
    await prisma.eventType.deleteMany({ where: { id: { in: ids.eventTypeIds } } });
  }
  if (ids.adminIds?.length) {
    await prisma.admin.deleteMany({ where: { id: { in: ids.adminIds } } });
  }
}
