import Toybox.Lang;

// Calendar hand angles, ported from src/components/WeeklyCalendarWatch.tsx
// and src/components/watchCalendar.ts. Angles are degrees clockwise from 12.
module Calendar {

    const WEEK_COUNT = 53;
    const WEEK_OFFSET_DEG = 6.5;
    const DAY_SECTOR_OFFSET_DEG = 25.2;

    const DAYS_BEFORE_MONTH = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334] as Array<Number>;

    // Week-of-year hand: WEEK_OFFSET_DEG + (isoWeek - 1) * 360 / 53.
    function weekHandAngle(year as Number, month as Number, day as Number, dayOfWeek as Number) as Float {
        var week = isoWeek(year, month, day, dayOfWeek);
        return WEEK_OFFSET_DEG + (week - 1) * (360.0 / WEEK_COUNT);
    }

    // Day-of-week hand. dayOfWeek is Gregorian's 1 = Sunday .. 7 = Saturday,
    // so (dayOfWeek - 1) matches JavaScript's Date.getDay().
    function dayHandAngle(dayOfWeek as Number) as Float {
        var step = 360.0 / 7;
        return DAY_SECTOR_OFFSET_DEG - step / 2 + (dayOfWeek - 1) * step;
    }

    // ISO 8601 week number (1..53). Same result as isoWeekCoordinates() in watchCalendar.ts.
    function isoWeek(year as Number, month as Number, day as Number, dayOfWeek as Number) as Number {
        var isoWeekday = dayOfWeek == 1 ? 7 : dayOfWeek - 1; // Monday = 1 .. Sunday = 7
        var week = (dayOfYear(year, month, day) - isoWeekday + 10) / 7;
        if (week < 1) {
            return weeksInYear(year - 1);
        }
        if (week > weeksInYear(year)) {
            return 1;
        }
        return week;
    }

    function dayOfYear(year as Number, month as Number, day as Number) as Number {
        var n = DAYS_BEFORE_MONTH[month - 1] + day;
        if (month > 2 && isLeapYear(year)) {
            n += 1;
        }
        return n;
    }

    function isLeapYear(year as Number) as Boolean {
        return (year % 4 == 0 && year % 100 != 0) || year % 400 == 0;
    }

    // An ISO year has 53 weeks when it starts on a Thursday, or is a leap year starting on a Wednesday.
    function weeksInYear(year as Number) as Number {
        if (yearShift(year) == 4 || yearShift(year - 1) == 3) {
            return 53;
        }
        return 52;
    }

    function yearShift(year as Number) as Number {
        return (year + year / 4 - year / 100 + year / 400) % 7;
    }
}
