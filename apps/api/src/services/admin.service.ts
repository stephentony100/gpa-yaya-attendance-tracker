import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { nanoid } from "nanoid";
import QRCode from "qrcode";
import { Prisma } from "../generated/prisma/client";
import { prisma } from "../lib/prisma";
import { env } from "../lib/env";
import { HttpError } from "../lib/errors";

function endOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

function buildQrUrl(qrToken: string): string {
  return `${env.FRONTEND_URL}/checkin/${qrToken}`;
}

const SESSION_INCLUDE = { eventType: true, createdBy: true } as const;

// ── Auth ─────────────────────────────────────────────────────────

export async function login(email: unknown, password: unknown) {
  if (typeof email !== "string" || typeof password !== "string" || !email || !password) {
    throw new HttpError(400, "email and password are required.");
  }

  const admin = await prisma.admin.findUnique({ where: { email } });
  if (!admin) {
    throw new HttpError(401, "Invalid credentials.");
  }

  const valid = await bcrypt.compare(password, admin.passwordHash);
  if (!valid) {
    throw new HttpError(401, "Invalid credentials.");
  }

  const token = jwt.sign(
    { sub: admin.id, name: admin.name, email: admin.email },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"] }
  );

  return {
    token,
    admin: { id: admin.id, name: admin.name, email: admin.email },
  };
}

// ── Event types ──────────────────────────────────────────────────

export async function listEventTypes() {
  return prisma.eventType.findMany({ orderBy: { name: "asc" } });
}

export async function createEventType(body: unknown) {
  const input = (typeof body === "object" && body !== null ? body : {}) as Record<
    string,
    unknown
  >;

  const name = typeof input.name === "string" ? input.name.trim() : "";
  if (!name) {
    throw new HttpError(400, "Validation failed", {
      fieldErrors: { name: "name is required." },
    });
  }

  const isRecurring = Boolean(input.is_recurring);
  const recurrencePattern =
    typeof input.recurrence_pattern === "string" ? input.recurrence_pattern : null;

  return prisma.eventType.create({
    data: { name, isRecurring, recurrencePattern },
  });
}

// ── Sessions ─────────────────────────────────────────────────────

interface SessionListFilters {
  eventTypeId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export async function listSessions(filters: SessionListFilters) {
  const where: Prisma.SessionWhereInput = {};

  if (filters.eventTypeId) {
    where.eventTypeId = filters.eventTypeId;
  }
  if (filters.dateFrom || filters.dateTo) {
    where.date = {};
    if (filters.dateFrom) where.date.gte = new Date(filters.dateFrom);
    if (filters.dateTo) where.date.lte = new Date(filters.dateTo);
  }

  const sessions = await prisma.session.findMany({
    where,
    orderBy: { date: "desc" },
    include: { ...SESSION_INCLUDE, _count: { select: { attendances: true } } },
  });

  return sessions.map((session) => ({ session, attendanceCount: session._count.attendances }));
}

export async function createSession(adminId: string, body: unknown) {
  const input = (typeof body === "object" && body !== null ? body : {}) as Record<
    string,
    unknown
  >;
  const errors: Record<string, string> = {};

  const eventTypeId = typeof input.event_type_id === "string" ? input.event_type_id : "";
  if (!eventTypeId) {
    errors.event_type_id = "event_type_id is required.";
  }

  const dateStr = typeof input.date === "string" ? input.date : "";
  if (!dateStr || Number.isNaN(Date.parse(dateStr))) {
    errors.date = "date must be a valid ISO date string (YYYY-MM-DD).";
  }

  if (Object.keys(errors).length > 0) {
    throw new HttpError(400, "Validation failed", { fieldErrors: errors });
  }

  const eventType = await prisma.eventType.findUnique({ where: { id: eventTypeId } });
  if (!eventType) {
    throw new HttpError(400, "Validation failed", {
      fieldErrors: { event_type_id: "Event type not found." },
    });
  }

  const date = new Date(dateStr);
  const session = await prisma.session.create({
    data: {
      eventTypeId,
      date,
      qrToken: nanoid(12),
      expiresAt: endOfDay(date),
      createdById: adminId,
    },
    include: SESSION_INCLUDE,
  });

  return { session, qrUrl: buildQrUrl(session.qrToken) };
}

export async function getSessionQrPng(id: string): Promise<Buffer> {
  const session = await prisma.session.findUnique({ where: { id } });
  if (!session) {
    throw new HttpError(404, "Session not found.");
  }

  return QRCode.toBuffer(buildQrUrl(session.qrToken), { type: "png" });
}

export async function closeSession(id: string) {
  const session = await prisma.session.findUnique({ where: { id } });
  if (!session) {
    throw new HttpError(404, "Session not found.");
  }
  if (session.closedAt !== null) {
    throw new HttpError(400, "Session is already closed.");
  }

  const updated = await prisma.session.update({
    where: { id },
    data: { closedAt: new Date() },
    include: { ...SESSION_INCLUDE, _count: { select: { attendances: true } } },
  });

  return { session: updated, attendanceCount: updated._count.attendances };
}

// ── Attendance ───────────────────────────────────────────────────

interface AttendanceFilters {
  eventTypeId?: string;
  dateFrom?: string;
  dateTo?: string;
  sessionId?: string;
  department?: string;
}

function buildAttendanceWhere(filters: AttendanceFilters): Prisma.AttendanceWhereInput {
  const sessionWhere: Prisma.SessionWhereInput = {};

  if (filters.eventTypeId) sessionWhere.eventTypeId = filters.eventTypeId;
  if (filters.sessionId) sessionWhere.id = filters.sessionId;
  if (filters.dateFrom || filters.dateTo) {
    sessionWhere.date = {};
    if (filters.dateFrom) sessionWhere.date.gte = new Date(filters.dateFrom);
    if (filters.dateTo) sessionWhere.date.lte = new Date(filters.dateTo);
  }

  const where: Prisma.AttendanceWhereInput = {};
  if (Object.keys(sessionWhere).length > 0) {
    where.session = sessionWhere;
  }
  if (filters.department) {
    where.member = { department: { has: filters.department } };
  }

  return where;
}

const ATTENDANCE_INCLUDE = { member: true, session: { include: { eventType: true } } } as const;

export async function listAttendance(
  filters: AttendanceFilters & { page: number; limit: number }
) {
  const where = buildAttendanceWhere(filters);
  const page = filters.page;
  const limit = filters.limit;

  const [records, total] = await Promise.all([
    prisma.attendance.findMany({
      where,
      include: ATTENDANCE_INCLUDE,
      orderBy: { markedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.attendance.count({ where }),
  ]);

  return { records, total, page, limit };
}

export async function listAttendanceForExport(filters: AttendanceFilters) {
  const where = buildAttendanceWhere(filters);
  return prisma.attendance.findMany({
    where,
    include: ATTENDANCE_INCLUDE,
    orderBy: { markedAt: "desc" },
  });
}

// ── Members ──────────────────────────────────────────────────────

export async function listMembers(filters: { department?: string; search?: string }) {
  const where: Prisma.MemberWhereInput = {};

  if (filters.department) {
    where.department = { has: filters.department };
  }
  if (filters.search) {
    where.OR = [
      { fullName: { contains: filters.search, mode: "insensitive" } },
      { phoneNumber: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  return prisma.member.findMany({ where, orderBy: { fullName: "asc" } });
}
