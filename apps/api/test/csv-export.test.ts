import { randomUUID } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { prisma } from "../src/lib/prisma";
import { buildAttendanceCsv } from "../src/lib/csv";
import { listAttendanceForExport } from "../src/services/admin.service";
import { createTestAdmin, createTestEventType, createTestSession, cleanupTestData, testPhoneNumber } from "./helpers";

describe("CSV export", () => {
  let adminId: string;
  let eventTypeId: string;
  let sessionId: string;
  let memberId: string;

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

    const member = await prisma.member.create({
      data: {
        fullName: "Vitest CSV Member",
        phoneNumber: testPhoneNumber(),
        gender: "OTHER",
        dateOfBirth: new Date("1995-03-15"),
        department: ["Choir", "Drama"],
        deviceToken: randomUUID(),
      },
    });
    memberId = member.id;

    await prisma.attendance.create({ data: { memberId, sessionId } });
  });

  afterEach(async () => {
    await cleanupTestData({
      sessionIds: [sessionId],
      memberIds: [memberId],
      adminIds: [adminId],
      eventTypeIds: [eventTypeId],
    });
  });

  it("exports the correct headers and row shape for seeded records", async () => {
    const records = await listAttendanceForExport({ sessionId });
    const csv = buildAttendanceCsv(records);
    const lines = csv.split("\n");

    expect(lines[0]).toBe("Member Name,Phone,Gender,Department(s),Event,Date,Time Marked");
    expect(lines).toHaveLength(2);

    const row = lines[1].split(",");
    expect(row[0]).toBe("Vitest CSV Member");
    expect(row[2]).toBe("OTHER");
    expect(row[3]).toBe("Choir; Drama");
  });

  it("produces no data rows when no attendance matches the filter", async () => {
    const records = await listAttendanceForExport({ sessionId: "00000000-0000-0000-0000-000000000000" });
    const csv = buildAttendanceCsv(records);

    expect(csv).toBe("Member Name,Phone,Gender,Department(s),Event,Date,Time Marked");
  });
});
