export function isoWeekCoordinates(date: Date) {
  const target = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNumber = target.getUTCDay() || 7;
  target.setUTCDate(target.getUTCDate() + 4 - dayNumber);
  const year = target.getUTCFullYear();
  const yearStart = new Date(Date.UTC(year, 0, 1));
  const week = Math.ceil(((target.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
  return { week, year };
}

export function continuousIsoWeek(date: Date, anchorIsoWeekYear: number, weekCount: number) {
  const isoWeek = isoWeekCoordinates(date);
  return isoWeek.week + (isoWeek.year - anchorIsoWeekYear) * weekCount;
}

export function localCalendarDayOrdinal(date: Date) {
  return Math.floor(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000,
  );
}

export function calendarMonthOrdinal(date: Date) {
  return date.getFullYear() * 12 + date.getMonth();
}

export function unwrapCyclicAngles(angles: readonly number[]) {
  let previous = Number.NEGATIVE_INFINITY;
  return angles.map((angle) => {
    let unwrapped = angle;
    while (unwrapped <= previous) unwrapped += 360;
    previous = unwrapped;
    return unwrapped;
  });
}

export function continuousDateWheelAngle(
  date: Date,
  anchorMonthOrdinal: number,
  unwrappedDayAngles: readonly number[],
) {
  const monthTurns = calendarMonthOrdinal(date) - anchorMonthOrdinal;
  return unwrappedDayAngles[date.getDate() - 1] + monthTurns * 360;
}
