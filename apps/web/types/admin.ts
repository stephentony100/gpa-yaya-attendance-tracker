import type { Gender } from "./checkin";

export interface Admin {
  id: string;
  name: string;
  email: string;
}

export interface LoginResponseData {
  token: string;
  admin: Admin;
}

export interface EventType {
  id: string;
  name: string;
  is_recurring: boolean;
  recurrence_pattern: string | null;
  created_at: string;
}

export type SessionStatus = "active" | "expired" | "closed";

export interface AdminSession {
  id: string;
  event_type_id: string;
  event_type_name: string;
  date: string;
  qr_token: string;
  expires_at: string;
  closed_at: string | null;
  created_by_name: string;
  created_at: string;
  attendance_count: number;
  status: SessionStatus;
}

export interface CreateSessionResponseData extends AdminSession {
  qr_url: string;
}

export interface AttendanceRecord {
  id: string;
  member_name: string;
  phone: string;
  gender: Gender;
  departments: string[];
  event: string;
  date: string;
  marked_at: string;
}

export interface AttendanceListResponseData {
  records: AttendanceRecord[];
  total: number;
  page: number;
  limit: number;
}

export interface MemberDirectoryEntry {
  id: string;
  full_name: string;
  phone_number: string;
  gender: Gender;
  date_of_birth: string;
  departments: string[];
  profile_photo_url: string | null;
  created_at: string;
}

export interface AttendanceFilters {
  event_type_id?: string;
  date_from?: string;
  date_to?: string;
  session_id?: string;
  department?: string;
}

export interface SessionFilters {
  event_type_id?: string;
  date_from?: string;
  date_to?: string;
}
