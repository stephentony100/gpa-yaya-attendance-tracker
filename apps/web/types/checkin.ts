export type Gender = "MALE" | "FEMALE" | "OTHER";

export const DEPARTMENTS = [
  "Choir",
  "Drama",
  "Ushering",
  "Protocol",
  "Prayer",
  "Bible Study",
  "Evangelism",
  "Welfare",
  "Follow-up",
  "Media & Publicity",
  "Sports",
] as const;

export type Department = (typeof DEPARTMENTS)[number];

export interface SessionPublic {
  id: string;
  event_type_name: string;
  date: string;
  expires_at: string;
}

export interface MemberPublic {
  id: string;
  full_name: string;
  phone_number: string;
  gender: Gender;
  date_of_birth: string;
  departments: string[];
  profile_photo_url: string | null;
  created_at: string;
}

export interface MemberLookup {
  id: string;
  full_name: string;
  phone: string;
}

export interface AttendanceStub {
  id: string;
  marked_at: string;
}

export interface RegisterPayload {
  full_name: string;
  phone_number: string;
  gender: Gender;
  date_of_birth: string;
  departments: string[];
  profile_photo_url?: string;
}

export interface RegisterResponseData {
  member: MemberPublic;
  device_token: string;
  attendance: AttendanceStub;
  session: SessionPublic;
}

export interface MarkResponseData {
  member: MemberPublic;
  session: SessionPublic;
  attendance: AttendanceStub;
  already_marked: boolean;
}

export interface LinkDeviceResponseData {
  device_token: string;
}

export interface FieldErrors {
  fieldErrors?: Record<string, string>;
  recovery?: boolean;
}
