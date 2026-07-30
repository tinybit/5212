import { describe, expect, it } from "vitest";

import {
  calendarMonthOrdinal,
  continuousDateWheelAngle,
  continuousIsoWeek,
  isoWeekCoordinates,
  unwrapCyclicAngles,
} from "./watchCalendar";

describe("continuous ISO week rotation", () => {
  it("advances one sector from week 53 to week 1", () => {
    const week53 = new Date(2020, 11, 28);
    const week1 = new Date(2021, 0, 4);

    expect(isoWeekCoordinates(week53)).toEqual({ week: 53, year: 2020 });
    expect(isoWeekCoordinates(week1)).toEqual({ week: 1, year: 2021 });
    expect(continuousIsoWeek(week1, 2020, 53) - continuousIsoWeek(week53, 2020, 53)).toBe(1);
  });

  it("skips the unused week 53 sector after a 52-week year", () => {
    const week52 = new Date(2022, 11, 26);
    const week1 = new Date(2023, 0, 2);

    expect(isoWeekCoordinates(week52)).toEqual({ week: 52, year: 2022 });
    expect(isoWeekCoordinates(week1)).toEqual({ week: 1, year: 2023 });
    expect(continuousIsoWeek(week1, 2022, 53) - continuousIsoWeek(week52, 2022, 53)).toBe(2);
  });
});

describe("perpetual date wheel rotation", () => {
  const step = 360 / 31;
  const dayAngles = unwrapCyclicAngles(
    Array.from({ length: 31 }, (_, index) => (index * step) % 360),
  );

  const movedSlots = (from: Date, to: Date) => {
    const anchorMonth = calendarMonthOrdinal(from);
    return (
      (continuousDateWheelAngle(to, anchorMonth, dayAngles) -
        continuousDateWheelAngle(from, anchorMonth, dayAngles)) /
      step
    );
  };

  it("moves directly from day 31 to day 1", () => {
    expect(movedSlots(new Date(2026, 0, 31), new Date(2026, 1, 1))).toBeCloseTo(1);
  });

  it("skips day 31 after a 30-day month", () => {
    expect(movedSlots(new Date(2026, 3, 30), new Date(2026, 4, 1))).toBeCloseTo(2);
  });

  it("skips invalid February dates in common and leap years", () => {
    expect(movedSlots(new Date(2026, 1, 28), new Date(2026, 2, 1))).toBeCloseTo(4);
    expect(movedSlots(new Date(2028, 1, 29), new Date(2028, 2, 1))).toBeCloseTo(3);
  });
});
