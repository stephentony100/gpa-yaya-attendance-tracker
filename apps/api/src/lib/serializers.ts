import type { Admin, Attendance, EventType, Member, Session } from "../generated/prisma/client";
import { computeSessionStatus } from "./sessionStatus";

export function serializeMemberPublic(member: Member) {
  return {
    id: member.id,
    full_name: member.fullName,
    phone_number: member.phoneNumber,
    gender: member.gender,
    date_of_birth: member.dateOfBirth,
    departments: member.department,
    profile_photo_url: member.profilePhotoUrl,
    created_at: member.createdAt,
  };
}

export function serializeMemberLookup(member: Member) {
  return {
    id: member.id,
    full_name: member.fullName,
    phone: maskPhone(member.phoneNumber),
  };
}

export function serializeSessionPublic(session: Session & { eventType: EventType }) {
  return {
    id: session.id,
    event_type_name: session.eventType.name,
    date: session.date,
    expires_at: session.expiresAt,
  };
}

export function serializeEventType(eventType: EventType) {
  return {
    id: eventType.id,
    name: eventType.name,
    is_recurring: eventType.isRecurring,
    recurrence_pattern: eventType.recurrencePattern,
    created_at: eventType.createdAt,
  };
}

export function serializeAdminSession(
  session: Session & { eventType: EventType; createdBy: Admin },
  attendanceCount: number
) {
  return {
    id: session.id,
    event_type_id: session.eventTypeId,
    event_type_name: session.eventType.name,
    date: session.date,
    qr_token: session.qrToken,
    expires_at: session.expiresAt,
    closed_at: session.closedAt,
    created_by_name: session.createdBy.name,
    created_at: session.createdAt,
    attendance_count: attendanceCount,
    status: computeSessionStatus(session),
  };
}

export function serializeAttendanceRecord(
  record: Attendance & { member: Member; session: Session & { eventType: EventType } }
) {
  return {
    id: record.id,
    member_name: record.member.fullName,
    phone: record.member.phoneNumber,
    gender: record.member.gender,
    departments: record.member.department,
    event: record.session.eventType.name,
    date: record.session.date,
    marked_at: record.markedAt,
  };
}

export function maskPhone(phone: string): string {
  const hasPlus = phone.startsWith("+");
  const rest = hasPlus ? phone.slice(1) : phone;

  if (rest.length <= 4) {
    return phone;
  }

  const countryCodeLength = hasPlus ? Math.min(3, rest.length - 4) : 0;
  const countryCode = rest.slice(0, countryCodeLength);
  const middle = rest.slice(countryCodeLength, rest.length - 4);
  const last4 = rest.slice(-4);

  const maskedGroups = middle.replace(/./g, "*").match(/.{1,3}/g) ?? [];
  const prefix = hasPlus ? `+${countryCode}` : countryCode;

  return [prefix, ...maskedGroups, last4].filter(Boolean).join(" ");
}
