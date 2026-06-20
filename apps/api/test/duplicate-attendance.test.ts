import { randomUUID } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { prisma } from "../src/lib/prisma";
import { markAttendance } from "../src/services/checkin.service";
import {
  createTestAdmin,
  createTestEventType,
  createTestSession,
  cleanupTestData,
  testPhoneNumber,
} from "./helpers";

describe("duplicate attendance handling", () => {
  let adminId: string;
  let eventTypeId: string;
  let sessionId: string;
  let qrToken: string;
  let memberId: string;
  let deviceToken: string;

  beforeEach(async () => {
    const admin = await createTestAdmin();
    adminId = admin.id;
    const eventType = await createTestEventType();
    eventTypeId = eventType.id;
    const session = await createTestSession({
      eventTypeId,
      createdById: adminId,
      expiresAt: new Date(Date.now() + 3_600_000),
    });
    sessionId = session.id;
    qrToken = session.qrToken;

    deviceToken = randomUUID();
    const member = await prisma.member.create({
      data: {
        fullName: "Vitest Dup Member",
        phoneNumber: testPhoneNumber(),
        gender: "FEMALE",
        dateOfBirth: new Date("1999-05-05"),
        department: ["Drama"],
        deviceToken,
      },
    });
    memberId = member.id;
  });

  afterEach(async () => {
    await cleanupTestData({
      sessionIds: [sessionId],
      memberIds: [memberId],
      adminIds: [adminId],
      eventTypeIds: [eventTypeId],
    });
  });

  it("returns already_marked on the second /mark call for the same session, not an error", async () => {
    const first = await markAttendance(qrToken, deviceToken);
    expect(first.alreadyMarked).toBe(false);

    const second = await markAttendance(qrToken, deviceToken);
    expect(second.alreadyMarked).toBe(true);
    expect(second.attendance.id).toBe(first.attendance.id);

    const count = await prisma.attendance.count({ where: { memberId, sessionId } });
    expect(count).toBe(1);
  });
});
