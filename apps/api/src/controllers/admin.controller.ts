import type { Request, Response } from "express";
import * as adminService from "../services/admin.service";
import {
  serializeAdminSession,
  serializeAttendanceRecord,
  serializeEventType,
  serializeMemberPublic,
} from "../lib/serializers";
import { buildAttendanceCsv } from "../lib/csv";

function queryString(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function queryInt(value: unknown, fallback: number): number {
  const parsed = typeof value === "string" ? Number.parseInt(value, 10) : NaN;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function attendanceFiltersFromQuery(query: Request["query"]) {
  return {
    eventTypeId: queryString(query.event_type_id),
    dateFrom: queryString(query.date_from),
    dateTo: queryString(query.date_to),
    sessionId: queryString(query.session_id),
    department: queryString(query.department),
  };
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body ?? {};
  const result = await adminService.login(email, password);
  res.json({ success: true, data: result });
}

export async function listEventTypes(req: Request, res: Response) {
  const eventTypes = await adminService.listEventTypes();
  res.json({ success: true, data: eventTypes.map(serializeEventType) });
}

export async function createEventType(req: Request, res: Response) {
  const eventType = await adminService.createEventType(req.body);
  res.status(201).json({ success: true, data: serializeEventType(eventType) });
}

export async function listSessions(req: Request, res: Response) {
  const results = await adminService.listSessions({
    eventTypeId: queryString(req.query.event_type_id),
    dateFrom: queryString(req.query.date_from),
    dateTo: queryString(req.query.date_to),
  });

  res.json({
    success: true,
    data: results.map(({ session, attendanceCount }) =>
      serializeAdminSession(session, attendanceCount)
    ),
  });
}

export async function createSession(req: Request, res: Response) {
  const { session, qrUrl } = await adminService.createSession(req.admin!.id, req.body);
  res.status(201).json({
    success: true,
    data: { ...serializeAdminSession(session, 0), qr_url: qrUrl },
  });
}

export async function getSessionQr(req: Request, res: Response) {
  const buffer = await adminService.getSessionQrPng(req.params.id as string);
  res.setHeader("Content-Type", "image/png");
  res.send(buffer);
}

export async function closeSession(req: Request, res: Response) {
  const { session, attendanceCount } = await adminService.closeSession(req.params.id as string);
  res.json({ success: true, data: serializeAdminSession(session, attendanceCount) });
}

export async function listAttendance(req: Request, res: Response) {
  const filters = attendanceFiltersFromQuery(req.query);
  const page = queryInt(req.query.page, 1);
  const limit = Math.min(queryInt(req.query.limit, 50), 100);

  const { records, total } = await adminService.listAttendance({ ...filters, page, limit });

  res.json({
    success: true,
    data: {
      records: records.map(serializeAttendanceRecord),
      total,
      page,
      limit,
    },
  });
}

export async function exportAttendance(req: Request, res: Response) {
  const filters = attendanceFiltersFromQuery(req.query);
  const records = await adminService.listAttendanceForExport(filters);
  const csv = buildAttendanceCsv(records);
  const filename = `yaya-attendance-${new Date().toISOString().slice(0, 10)}.csv`;

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.send(csv);
}

export async function listMembers(req: Request, res: Response) {
  const members = await adminService.listMembers({
    department: queryString(req.query.department),
    search: queryString(req.query.search),
  });
  res.json({ success: true, data: members.map(serializeMemberPublic) });
}

export async function changePassword(req: Request, res: Response) {
  const { current_password, new_password } = req.body ?? {};
  await adminService.changePassword(req.admin!.id, current_password, new_password);
  res.json({ success: true, message: "Password updated." });
}
