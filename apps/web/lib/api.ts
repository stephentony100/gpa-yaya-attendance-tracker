import { env } from "./env";
import type {
  FieldErrors,
  LinkDeviceResponseData,
  MarkResponseData,
  MemberLookup,
  RegisterPayload,
  RegisterResponseData,
  SessionPublic,
} from "@/types/checkin";

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
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<ApiResult<T>> {
  const headers: Record<string, string> = {};
  if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
  }
  if (options.deviceToken) {
    headers["X-Device-Token"] = options.deviceToken;
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

  const json = await res.json().catch(() => null);

  if (!res.ok) {
    throw new ApiError(res.status, json?.message ?? "Something went wrong.", json?.data);
  }

  return { data: json.data as T, message: json.message as string | undefined };
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

  lookupByPhone: (phone: string) =>
    request<MemberLookup>(`/members/lookup?phone=${encodeURIComponent(phone)}`),

  linkDevice: (memberId: string, phoneNumber: string) =>
    request<LinkDeviceResponseData>(`/members/${memberId}/link-device`, {
      method: "POST",
      body: { phone_number: phoneNumber },
    }),
};
