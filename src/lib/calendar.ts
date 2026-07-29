/** ISO week number (1–53) for a given date. */
export function getIsoWeek(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

export function getIsoWeekYear(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  return d.getUTCFullYear();
}

export function daysInMonth(year: number, monthIndex: number): number {
  return new Date(year, monthIndex + 1, 0).getDate();
}

export const MONTHS = [
  "JANUARY",
  "FEBRUARY",
  "MARCH",
  "APRIL",
  "MAY",
  "JUNE",
  "JULY",
  "AUGUST",
  "SEPTEMBER",
  "OCTOBER",
  "NOVEMBER",
  "DECEMBER",
] as const;

export const DAYS = [
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
] as const;

/** Angle for week-of-year pointer: week 1 at top, clockwise around 53 positions. */
export function weekAngleDeg(week: number): number {
  const w = Math.min(53, Math.max(1, week));
  return ((w - 1) / 53) * 360;
}

/** Angle for day-of-week pointer: Sunday at top, clockwise. */
export function dayAngleDeg(dayIndex: number): number {
  return (dayIndex / 7) * 360;
}

/** Angle for month pointer: January at top, clockwise. */
export function monthAngleDeg(monthIndex: number): number {
  return (monthIndex / 12) * 360;
}
