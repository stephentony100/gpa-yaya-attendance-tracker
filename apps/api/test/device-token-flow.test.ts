import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { registerMember, markAttendance } from "../src/services/checkin.service";
import {
  createTestAdmin,
  createTestEventType,
  createTestSession,
  cleanupTestData,
  testPhoneNumber,
} from "./helpers";

describe("device-token register -> mark flow", () => {
  let adminId: string;
  let eventTypeId: string;
  let sessionId: string;
  let qrToken: string;
  let memberIds: string[] = [];

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
    memberIds = [];
  });

  afterEach(async () => {
    await cleanupTestData({
      sessionIds: [sessionId],
      memberIds,
      adminIds: [adminId],
      eventTypeIds: [eventTypeId],
    });
  });

  it("returns a working device token on registration, and /mark identifies the same member with it", async () => {
    const { member, deviceToken } = await registerMember(qrToken, {
      full_name: "Vitest Member",
      phone_number: testPhoneNumber(),
      gender: "MALE",
      date_of_birth: "2000-01-01",
      departments: ["Choir"],
    });
    memberIds.push(member.id);

    expect(deviceToken).toBeTruthy();

    const result = await markAttendance(qrToken, deviceToken);

    expect(result.member.id).toBe(member.id);
    // Registration already created the attendance row for this session, so the
    // /mark call here is necessarily a re-scan — that's covered in depth by the
    // dedicated duplicate-attendance test; this test's focus is identity matching.
    expect(result.alreadyMarked).toBe(true);
  });

  it("rejects /mark with an unknown device token", async () => {
    await expect(markAttendance(qrToken, "not-a-real-device-token")).rejects.toMatchObject({
      statusCode: 404,
    });
  });
});
