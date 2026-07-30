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
