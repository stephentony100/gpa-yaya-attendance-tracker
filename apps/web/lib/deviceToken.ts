const DEVICE_TOKEN_KEY = "yaya_device_token";

export function getDeviceToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(DEVICE_TOKEN_KEY);
}

export function setDeviceToken(token: string): void {
  window.localStorage.setItem(DEVICE_TOKEN_KEY, token);
}

export function clearDeviceToken(): void {
  window.localStorage.removeItem(DEVICE_TOKEN_KEY);
}
