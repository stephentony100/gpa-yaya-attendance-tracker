import type { Admin } from "@/types/admin";

const ADMIN_TOKEN_KEY = "yaya_admin_token";
const ADMIN_INFO_KEY = "yaya_admin_info";

export function getAdminToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(ADMIN_TOKEN_KEY);
}

export function setAdminToken(token: string): void {
  window.localStorage.setItem(ADMIN_TOKEN_KEY, token);
}

export function clearAdminToken(): void {
  window.localStorage.removeItem(ADMIN_TOKEN_KEY);
  window.localStorage.removeItem(ADMIN_INFO_KEY);
}

export function getAdminInfo(): Admin | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(ADMIN_INFO_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Admin;
  } catch {
    return null;
  }
}

export function setAdminInfo(admin: Admin): void {
  window.localStorage.setItem(ADMIN_INFO_KEY, JSON.stringify(admin));
}
