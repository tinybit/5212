import Toybox.Graphics;
import Toybox.Lang;
import Toybox.System;
import Toybox.Time;
import Toybox.Time.Gregorian;
import Toybox.WatchUi;

// Patek Philippe 5212A weekly-calendar dial: a static dial bitmap rendered
// from the web reconstruction, a date-window bitmap per day, and five hands
// drawn as polygons (bitmaps cannot be rotated on every target watch).
class Face5212View extends WatchUi.WatchFace {

    // Photo-pixel geometry from WeeklyCalendarWatch.tsx, used for the date-window position.
    private const DIAL_LEFT = 351;    // CX - R_DIAL_EDGE
    private const DIAL_TOP = 301;     // CY - R_DIAL_EDGE
    private const DIAL_SPAN = 2060;   // 2 * R_DIAL_EDGE
    private const DATE_CLIP_LEFT = 2017;
    private const DATE_CLIP_TOP = 1264;

    private var _dial as BitmapResource?;
    private var _date as BitmapResource?;
    private var _dateDay as Number = 0;
    private var _dateX as Number = 0;
    private var _dateY as Number = 0;
    private var _awake as Boolean = true;
    // AMOLED screens: full colours awake, and a mostly black always-on view.
    private var _burnInProtection as Boolean = false;

    function initialize() {
        WatchFace.initialize();
    }

    function onLayout(dc as Dc) as Void {
        var width = dc.getWidth();
        var settings = System.getDeviceSettings();
        _burnInProtection = (settings has :requiresBurnInProtection) && settings.requiresBurnInProtection;
        Hands.setup(width, _burnInProtection);
        // Same integer formula as dateCrop() in tools/export-assets.mjs.
        _dateX = ((DATE_CLIP_LEFT - DIAL_LEFT) * width) / DIAL_SPAN;
        _dateY = ((DATE_CLIP_TOP - DIAL_TOP) * width) / DIAL_SPAN;
        _dial = WatchUi.loadResource(Rez.Drawables.Dial) as BitmapResource;
        var stats = System.getSystemStats();
        System.println("screen " + width + ", burn-in protection " + _burnInProtection
            + ", memory after dial: " + stats.usedMemory + " / " + stats.totalMemory);
    }

    function onUpdate(dc as Dc) as Void {
        var info = Gregorian.info(Time.now(), Time.FORMAT_SHORT);
        var hour = info.hour as Number;
        var min = info.min as Number;
        var sec = info.sec as Number;
        var hourAngle = ((hour % 12) + min / 60.0 + sec / 3600.0) * 30.0;
        var minuteAngle = (min + sec / 60.0) * 6.0;

        if (dc has :setAntiAlias) {
            dc.setAntiAlias(true);
        }

        // Low power when either signal says so: the sleep callbacks, or the display
        // mode the system reports (AMOLED devices, API 5+). Trusting one alone can
        // draw the full dial into an always-on frame, which trips the burn-in
        // protector: the watch then blanks the screen and greys out "Always On".
        var lowPower = !_awake;
        if (System has :getDisplayMode) {
            var mode = System.getDisplayMode();
            if (mode == System.DISPLAY_MODE_OFF) {
                return;
            }
            lowPower = lowPower || mode == System.DISPLAY_MODE_LOW_POWER;
        }

        if (lowPower && _burnInProtection) {
            // Always-on view: black screen, hour and minute hands only. Well under the
            // 10% luminance budget; shifted a pixel each minute so no pixel stays lit.
            dc.setColor(Graphics.COLOR_BLACK, Graphics.COLOR_BLACK);
            dc.clear();
            Hands.drawSleep(dc, hourAngle, minuteAngle, (min % 3) - 1, ((min / 3) % 3) - 1);
            return;
        }

        var year = info.year as Number;
        var month = info.month as Number;
        var day = info.day as Number;
        var dayOfWeek = info.day_of_week as Number;
        if (day != _dateDay) {
            _date = null;
            _date = WatchUi.loadResource(Generated.dateBitmapId(day)) as BitmapResource;
            _dateDay = day;
        }

        dc.drawBitmap(0, 0, _dial as BitmapResource);
        dc.drawBitmap(_dateX, _dateY, _date as BitmapResource);

        // Stacking order matches the web app: day, week, hour, minute, seconds.
        Hands.drawDay(dc, Calendar.dayHandAngle(dayOfWeek));
        Hands.drawWeek(dc, Calendar.weekHandAngle(year, month, day, dayOfWeek));
        Hands.drawHour(dc, hourAngle);
        Hands.drawMinute(dc, minuteAngle);
        if (lowPower) {
            // Low-power mode redraws once a minute, so the seconds hand would be wrong.
            Hands.drawHub(dc);
        } else {
            Hands.drawSeconds(dc, sec * 6.0);
        }
    }

    function onExitSleep() as Void {
        _awake = true;
        WatchUi.requestUpdate();
    }

    function onEnterSleep() as Void {
        _awake = false;
        WatchUi.requestUpdate();
    }

}
