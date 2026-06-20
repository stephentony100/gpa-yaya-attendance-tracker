import { randomUUID } from "node:crypto";
import { Prisma } from "../generated/prisma/client";
import type { Session, EventType } from "../generated/prisma/client";
import { prisma } from "../lib/prisma";
import { HttpError } from "../lib/errors";
import { DEPARTMENTS, GENDERS, type GenderInput } from "../lib/constants";
import { uploadImageBuffer } from "../lib/cloudinary";
import { endOfDayLagos } from "../lib/datetime";

type SessionWithEventType = Session & { eventType: EventType };

interface RegisterInput {
  fullName: string;
  phoneNumber: string;
  gender: GenderInput;
  dateOfBirth: Date;
  departments: string[];
  profilePhotoUrl?: string;
}

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function assertSessionOpen(session: { expiresAt: Date; closedAt: Date | null }) {
  if (session.closedAt !== null || new Date() >= session.expiresAt) {
    throw new HttpError(410, "This session has ended.");
  }
}

// `expires_at` is NOT NULL, but a session inserted directly (e.g. a manual seed,
// or a future admin flow that forgets to compute it) can leave it equal to
// midnight on `date` instead of 23:59:59. Treat that as "unset" and repair it here.
function isExpiresAtUnset(session: { date: Date; expiresAt: Date }): boolean {
  return session.expiresAt.getTime() === startOfDay(session.date).getTime();
}

export async function getOpenSession(qrToken: string): Promise<SessionWithEventType> {
  const session = await prisma.session.findUnique({
    where: { qrToken },
    include: { eventType: true },
  });

  if (!session) {
    throw new HttpError(404, "Session not found.");
  }

  assertSessionOpen(session);

  return session;
}

function validateRegisterPayload(body: unknown): RegisterInput {
  const errors: Record<string, string> = {};
  const input = (typeof body === "object" && body !== null ? body : {}) as Record<
    string,
    unknown
  >;

  const fullName = typeof input.full_name === "string" ? input.full_name.trim() : "";
  if (!fullName) {
    errors.full_name = "full_name is required.";
  }

  const phoneNumber = typeof input.phone_number === "string" ? input.phone_number.trim() : "";
  if (!phoneNumber) {
    errors.phone_number = "phone_number is required.";
  }

  const gender = input.gender;
  if (typeof gender !== "string" || !GENDERS.includes(gender as GenderInput)) {
    errors.gender = `gender must be one of: ${GENDERS.join(", ")}.`;
  }

  let dateOfBirth: Date | undefined;
  if (typeof input.date_of_birth !== "string" || Number.isNaN(Date.parse(input.date_of_birth))) {
    errors.date_of_birth = "date_of_birth must be a valid ISO date string.";
  } else {
    dateOfBirth = new Date(input.date_of_birth);
  }

  const departments = Array.isArray(input.departments) ? input.departments : undefined;
  if (!departments || departments.length === 0) {
    errors.departments = "departments must be a non-empty array.";
  } else {
    const invalid = departments.filter(
      (d) => typeof d !== "string" || !DEPARTMENTS.includes(d as (typeof DEPARTMENTS)[number])
    );
    if (invalid.length > 0) {
      errors.departments = `Invalid department(s): ${invalid.join(", ")}.`;
    }
  }

  const profilePhotoUrl = input.profile_photo_url;
  if (profilePhotoUrl !== undefined && typeof profilePhotoUrl !== "string") {
    errors.profile_photo_url = "profile_photo_url must be a string.";
  }

  if (Object.keys(errors).length > 0) {
    throw new HttpError(400, "Validation failed", { fieldErrors: errors });
  }

  return {
    fullName,
    phoneNumber,
    gender: gender as GenderInput,
    dateOfBirth: dateOfBirth as Date,
    departments: departments as string[],
    profilePhotoUrl: typeof profilePhotoUrl === "string" ? profilePhotoUrl : undefined,
  };
}

export async function registerMember(qrToken: string, body: unknown) {
  const input = validateRegisterPayload(body);

  let session = await getOpenSession(qrToken);
  if (isExpiresAtUnset(session)) {
    session = await prisma.session.update({
      where: { id: session.id },
      data: { expiresAt: endOfDayLagos(session.date) },
      include: { eventType: true },
    });
  }

  const existing = await prisma.member.findUnique({
    where: { phoneNumber: input.phoneNumber },
  });
  if (existing) {
    throw new HttpError(409, "Phone number already registered. Use the recovery flow.", {
      recovery: true,
    });
  }

  const deviceToken = randomUUID();

  const { member, attendance } = await prisma.$transaction(async (tx) => {
    const member = await tx.member.create({
      data: {
        fullName: input.fullName,
        phoneNumber: input.phoneNumber,
        gender: input.gender,
        dateOfBirth: input.dateOfBirth,
        department: input.departments,
        profilePhotoUrl: input.profilePhotoUrl,
        deviceToken,
      },
    });
    const attendance = await tx.attendance.create({
      data: { memberId: member.id, sessionId: session.id },
    });
    return { member, attendance };
  });

  return { member, attendance, session, deviceToken };
}

export async function uploadMemberPhoto(buffer: Buffer): Promise<string> {
  try {
    return await uploadImageBuffer(buffer);
  } catch {
    throw new HttpError(502, "Could not upload photo right now. You can continue without one.");
  }
}

export async function markAttendance(qrToken: string, deviceToken: string) {
  if (!deviceToken) {
    throw new HttpError(400, "X-Device-Token header is required.");
  }

  const member = await prisma.member.findUnique({ where: { deviceToken } });
  if (!member) {
    throw new HttpError(404, "Member not found for this device.");
  }

  const session = await getOpenSession(qrToken);

  // Check first instead of relying on the unique-constraint catch for the common
  // "member rescans" case: a thrown Prisma error here causes the pg adapter to
  // discard the pooled connection on release, forcing a fresh Neon TLS handshake
  // on every repeat scan.
  const existing = await prisma.attendance.findUnique({
    where: { memberId_sessionId: { memberId: member.id, sessionId: session.id } },
  });
  if (existing) {
    return { member, session, attendance: existing, alreadyMarked: true };
  }

  try {
    const attendance = await prisma.attendance.create({
      data: { memberId: member.id, sessionId: session.id },
    });
    return { member, session, attendance, alreadyMarked: false };
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      const attendance = await prisma.attendance.findUniqueOrThrow({
        where: { memberId_sessionId: { memberId: member.id, sessionId: session.id } },
      });
      return { member, session, attendance, alreadyMarked: true };
    }
    throw err;
  }
}
