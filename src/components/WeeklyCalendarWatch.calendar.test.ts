import { describe, expect, it } from "vitest";

import { continuousIsoWeek, isoWeekCoordinates } from "./watchCalendar";

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
