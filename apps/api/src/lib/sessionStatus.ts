export type SessionStatus = "active" | "expired" | "closed";

export function computeSessionStatus(session: {
  expiresAt: Date;
  closedAt: Date | null;
}): SessionStatus {
  if (session.closedAt !== null) {
    return "closed";
  }
  if (new Date() >= session.expiresAt) {
    return "expired";
  }
  return "active";
}
