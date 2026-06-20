// Africa/Lagos (WAT) has used a fixed UTC+1 offset year-round, with no DST,
// since 1919 — so a constant offset is correct and doesn't need a timezone
// database/library.
const LAGOS_UTC_OFFSET_HOURS = 1;

// Computes 23:59:59.999 Africa/Lagos time for the calendar date carried by
// `date`, returned as the equivalent UTC instant. Uses only getUTC*/Date.UTC
// so the result is identical no matter what timezone the host process runs
// in — unlike Date#setHours, which resolves against the process's local TZ.
export function endOfDayLagos(date: Date | string): Date {
  const d = typeof date === "string" ? new Date(date) : date;
  const year = d.getUTCFullYear();
  const month = d.getUTCMonth();
  const day = d.getUTCDate();
  return new Date(Date.UTC(year, month, day, 23 - LAGOS_UTC_OFFSET_HOURS, 59, 59, 999));
}
