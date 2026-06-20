import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { getOpenSession } from "../src/services/checkin.service";
import { createSession } from "../src/services/admin.service";
import { createTestAdmin, createTestEventType, createTestSession, cleanupTestData } from "./helpers";

describe("session expiry", () => {
  let adminId: string;
  let eventTypeId: string;
  let sessionIds: string[] = [];

  beforeEach(async () => {
    const admin = await createTestAdmin();
    adminId = admin.id;
    const eventType = await createTestEventType();
    eventTypeId = eventType.id;
    sessionIds = [];
  });

  afterEach(async () => {
    await cleanupTestData({ sessionIds, adminIds: [adminId], eventTypeIds: [eventTypeId] });
  });

  it("rejects a session whose expires_at is in the past", async () => {
    const session = await createTestSession({
      eventTypeId,
      createdById: adminId,
      expiresAt: new Date(Date.now() - 60_000),
    });
    sessionIds.push(session.id);

    await expect(getOpenSession(session.qrToken)).rejects.toMatchObject({ statusCode: 410 });
  });

  it("accepts a session whose expires_at is in the future", async () => {
    const session = await createTestSession({
      eventTypeId,
      createdById: adminId,
      expiresAt: new Date(Date.now() + 60_000),
    });
    sessionIds.push(session.id);

    const result = await getOpenSession(session.qrToken);
    expect(result.id).toBe(session.id);
  });

  it("rejects a session that has been explicitly closed, even if not yet expired", async () => {
    const session = await createTestSession({
      eventTypeId,
      createdById: adminId,
      expiresAt: new Date(Date.now() + 60_000),
      closedAt: new Date(),
    });
    sessionIds.push(session.id);

    await expect(getOpenSession(session.qrToken)).rejects.toMatchObject({ statusCode: 410 });
  });

  // TIMEZONE FIX (Phase 8.1) — expiresAt must represent 23:59:59.999 Africa/Lagos
  // (UTC+1, fixed, no DST), as a deterministic UTC instant, regardless of what
  // timezone the server process happens to run in. admin.service.ts now computes
  // this via endOfDayLagos() (src/lib/datetime.ts), which uses only getUTC*/Date.UTC
  // — never Date#setHours, which resolves against the process's local TZ.
  //
  // This test forces process.env.TZ to UTC before calling createSession, simulating
  // a bare Render container (which defaults to UTC unless TZ is set), and asserts the
  // computed expires_at is still the correct UTC instant for Lagos midnight: Lagos
  // 23:59:59.999 on 2026-07-01 == 2026-07-01T22:59:59.999Z.
  it("computes expires_at as Lagos 23:59:59.999 in UTC, even when the server process timezone is UTC", async () => {
    const originalTz = process.env.TZ;
    process.env.TZ = "UTC";
    try {
      const dateStr = "2026-07-01";
      const { session } = await createSession(adminId, {
        event_type_id: eventTypeId,
        date: dateStr,
      });
      sessionIds.push(session.id);

      expect(session.expiresAt.toISOString()).toBe("2026-07-01T22:59:59.999Z");
    } finally {
      process.env.TZ = originalTz;
    }
  });

  // Same calendar date, computed under a different host timezone (one with a large,
  // unrelated UTC offset) — must produce the exact same UTC instant as the UTC run
  // above. This is what actually proves the calculation is host-independent, rather
  // than just "happens to work under UTC."
  it("computes the identical UTC instant for the same date regardless of host timezone", async () => {
    const originalTz = process.env.TZ;
    process.env.TZ = "Pacific/Kiritimati"; // UTC+14 — about as far from Lagos as it gets
    try {
      const dateStr = "2026-07-01";
      const { session } = await createSession(adminId, {
        event_type_id: eventTypeId,
        date: dateStr,
      });
      sessionIds.push(session.id);

      expect(session.expiresAt.toISOString()).toBe("2026-07-01T22:59:59.999Z");
    } finally {
      process.env.TZ = originalTz;
    }
  });
});
