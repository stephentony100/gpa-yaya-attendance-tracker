import type { Attendance, EventType, Member, Session } from "../generated/prisma/client";

type AttendanceExportRow = Attendance & {
  member: Member;
  session: Session & { eventType: EventType };
};

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function buildAttendanceCsv(records: AttendanceExportRow[]): string {
  const header = [
    "Member Name",
    "Phone",
    "Gender",
    "Department(s)",
    "Event",
    "Date",
    "Time Marked",
  ];

  const rows = records.map((record) => [
    record.member.fullName,
    record.member.phoneNumber,
    record.member.gender,
    record.member.department.join("; "),
    record.session.eventType.name,
    formatDate(record.session.date),
    record.markedAt.toISOString(),
  ]);

  return [header, ...rows].map((row) => row.map(csvEscape).join(",")).join("\n");
}
