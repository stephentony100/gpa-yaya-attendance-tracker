import { env } from "./env";
import { clearAdminToken, getAdminToken } from "./adminAuth";
import type {
  FieldErrors,
  LinkDeviceResponseData,
  MarkResponseData,
  MemberLookup,
  RegisterPayload,
  RegisterResponseData,
  SessionPublic,
  UploadPhotoResponseData,
} from "@/types/checkin";
import type {
  AdminSession,
  AttendanceFilters,
  AttendanceListResponseData,
  CreateSessionResponseData,
  EventType,
  LoginResponseData,
  MemberDirectoryEntry,
  SessionFilters,
} from "@/types/admin";

export class ApiError extends Error {
  statusCode: number;
  data?: FieldErrors;

  constructor(statusCode: number, message: string, data?: FieldErrors) {
    super(message);
    this.statusCode = statusCode;
    this.data = data;
  }
}

interface ApiResult<T> {
  data: T;
  message?: string;
}

interface RequestOptions {
  method?: "GET" | "POST" | "PUT";
  body?: unknown;
  deviceToken?: string;
  adminAuth?: boolean;
}

function redirectToAdminLogin(): void {
  clearAdminToken();
  if (typeof window !== "undefined") {
    window.location.href = "/admin/login";
  }
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<ApiResult<T>> {
  const headers: Record<string, string> = {};
  if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
  }
  if (options.deviceToken) {
    headers["X-Device-Token"] = options.deviceToken;
  }
  if (options.adminAuth) {
    const token = getAdminToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  let res: Response;
  try {
    res = await fetch(`${env.NEXT_PUBLIC_API_URL}${path}`, {
      method: options.method ?? "GET",
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    });
  } catch {
    throw new ApiError(0, "Could not reach the server. Check your connection and try again.");
  }

  if (options.adminAuth && (res.status === 401 || res.status === 403)) {
    redirectToAdminLogin();
    throw new ApiError(res.status, "Your session has ended. Please sign in again.");
  }

  const json = await res.json().catch(() => null);

  if (!res.ok) {
    throw new ApiError(res.status, json?.message ?? "Something went wrong.", json?.data);
  }

  return { data: json.data as T, message: json.message as string | undefined };
}

async function downloadFile(path: string): Promise<{ blob: Blob; filename: string }> {
  const token = getAdminToken();
  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(`${env.NEXT_PUBLIC_API_URL}${path}`, { headers });
  } catch {
    throw new ApiError(0, "Could not reach the server. Check your connection and try again.");
  }

  if (res.status === 401 || res.status === 403) {
    redirectToAdminLogin();
    throw new ApiError(res.status, "Your session has ended. Please sign in again.");
  }

  if (!res.ok) {
    const json = await res.json().catch(() => null);
    throw new ApiError(res.status, json?.message ?? "Something went wrong.");
  }

  const disposition = res.headers.get("Content-Disposition") ?? "";
  const match = disposition.match(/filename="?([^"]+)"?/);
  const filename = match?.[1] ?? "download";

  return { blob: await res.blob(), filename };
}

async function uploadFile<T>(
  path: string,
  fieldName: string,
  file: File
): Promise<ApiResult<T>> {
  const formData = new FormData();
  formData.append(fieldName, file);

  let res: Response;
  try {
    res = await fetch(`${env.NEXT_PUBLIC_API_URL}${path}`, { method: "POST", body: formData });
  } catch {
    throw new ApiError(0, "Could not reach the server. Check your connection and try again.");
  }

  const json = await res.json().catch(() => null);

  if (!res.ok) {
    throw new ApiError(res.status, json?.message ?? "Something went wrong.", json?.data);
  }

  return { data: json.data as T, message: json.message as string | undefined };
}

function buildQuery(params: object): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") {
      search.set(key, String(value));
    }
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export const api = {
  getSession: (qrToken: string) => request<SessionPublic>(`/checkin/${qrToken}`),

  register: (qrToken: string, payload: RegisterPayload) =>
    request<RegisterResponseData>(`/checkin/${qrToken}/register`, {
      method: "POST",
      body: payload,
    }),

  mark: (qrToken: string, deviceToken: string) =>
    request<MarkResponseData>(`/checkin/${qrToken}/mark`, {
      method: "POST",
      deviceToken,
    }),

  uploadPhoto: (qrToken: string, file: File) =>
    uploadFile<UploadPhotoResponseData>(`/checkin/${qrToken}/upload-photo`, "photo", file),

  lookupByPhone: (phone: string) =>
    request<MemberLookup>(`/members/lookup?phone=${encodeURIComponent(phone)}`),

  linkDevice: (memberId: string, phoneNumber: string) =>
    request<LinkDeviceResponseData>(`/members/${memberId}/link-device`, {
      method: "POST",
      body: { phone_number: phoneNumber },
    }),
};

export const adminApi = {
  login: (email: string, password: string) =>
    request<LoginResponseData>("/admin/login", { method: "POST", body: { email, password } }),

  listEventTypes: () => request<EventType[]>("/admin/event-types", { adminAuth: true }),

  createEventType: (payload: {
    name: string;
    is_recurring: boolean;
    recurrence_pattern?: string | null;
  }) =>
    request<EventType>("/admin/event-types", {
      method: "POST",
      body: payload,
      adminAuth: true,
    }),

  listSessions: (filters: SessionFilters = {}) =>
    request<AdminSession[]>(`/admin/sessions${buildQuery(filters)}`, { adminAuth: true }),

  createSession: (payload: { event_type_id: string; date: string }) =>
    request<CreateSessionResponseData>("/admin/sessions", {
      method: "POST",
      body: payload,
      adminAuth: true,
    }),

  getSessionQr: (id: string) => downloadFile(`/admin/sessions/${id}/qr`),

  closeSession: (id: string) =>
    request<AdminSession>(`/admin/sessions/${id}/close`, { method: "PUT", adminAuth: true }),

  listAttendance: (filters: AttendanceFilters & { page?: number; limit?: number } = {}) =>
    request<AttendanceListResponseData>(`/admin/attendance${buildQuery(filters)}`, {
      adminAuth: true,
    }),

  exportAttendance: (filters: AttendanceFilters = {}) =>
    downloadFile(`/admin/attendance/export${buildQuery(filters)}`),

  listMembers: (filters: { department?: string; search?: string } = {}) =>
    request<MemberDirectoryEntry[]>(`/admin/members${buildQuery(filters)}`, { adminAuth: true }),

  changePassword: (currentPassword: string, newPassword: string) =>
    request<null>("/admin/change-password", {
      method: "PUT",
      body: { current_password: currentPassword, new_password: newPassword },
      adminAuth: true,
    }),
};
