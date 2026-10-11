import Toybox.Graphics;
import Toybox.Lang;
import Toybox.System;
import Toybox.Time;
import Toybox.Time.Gregorian;
import Toybox.Timer;
import Toybox.WatchUi;

// Patek Philippe 5212A weekly-calendar dial: a static dial bitmap rendered
// from the web reconstruction, a date-window bitmap per day, and five hands.
// The hands are polygons, except on the fēnix 8/9 generation of AMOLED watches
// (chosen per device in tools/export-assets.mjs), where the hour, minute and
// seconds hands are pre-rendered bitmaps rotated with sub-pixel precision (see
// Hands.drawBitmapHand). AMOLED watches get a second, inverted dial bitmap for
// the always-on view.
class Face5212View extends WatchUi.WatchFace {

    // Photo-pixel geometry from WeeklyCalendarWatch.tsx, used for the date-window position.
    private const DIAL_LEFT = 351;    // CX - R_DIAL_EDGE
    private const DIAL_TOP = 301;     // CY - R_DIAL_EDGE
    private const DIAL_SPAN = 2060;   // 2 * R_DIAL_EDGE
    private const DATE_CLIP_LEFT = 2017;
    private const DATE_CLIP_TOP = 1264;

    // The calibre 26-330 beats at 4 Hz (28,800 half-swings an hour): the seconds
    // hand advances eight times a second. While the watch is awake we redraw at
    // that rate; in low power the seconds hand is hidden anyway.
    // Only on the modern AMOLED watches (the ones this was built and tested on):
    // older and MIP watches keep the plain once-a-second hand. See beatSupported().
    private const BEATS_PER_SECOND = 8;
    private const BEAT_MS = 1000 / BEATS_PER_SECOND;

    private var _dial as BitmapResource?;
    private var _date as BitmapResource?;
    private var _dateDay as Number = 0;
    private var _dialAod as BitmapResource?;
    private var _dateAod as BitmapResource?;
    private var _dateAodDay as Number = 0;
    private var _dateX as Number = 0;
    private var _dateY as Number = 0;
    private var _awake as Boolean = true;
    // AMOLED screens: full colours awake, and the inverted always-on dial in sleep.
    private var _burnInProtection as Boolean = false;
    // Beat timer (awake only; starting a timer in low power crashes a watch face).
    private var _beat as Timer.Timer?;
    // Smallest (millisecond timer - clock seconds * 1000) seen so far: the timer
    // value at a clock-second boundary. The watch's own once-a-second redraw lands
    // on that boundary, so this converges within a second and then stays put.
    private var _phaseMs as Long = 0x7FFFFFFFFFFFFFFFl;
    // Day and week pointers glide to a new position when the change happens while the
    // watch is awake, where the image hands run (fēnix 8/9 generation): 400 ms with the web
    // dial's ease-out curve, redrawn 20 times a second by _glideTimer (see Glide.mc).
    // Asleep they jump, and after waking they are simply drawn where they belong.
    private const GLIDE_TICK_MS = 50;
    private var _dayGlide as Glide = new Glide();
    private var _weekGlide as Glide = new Glide();
    private var _dayShown as Float? = null;
    private var _weekShown as Float? = null;
    private var _glideTimer as Timer.Timer?;

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
        if (_burnInProtection) {
            _dialAod = WatchUi.loadResource(Rez.Drawables.DialAod) as BitmapResource;
        }
        var smooth = false;
        if (smoothHandsSupported(dc)) {
            var pivots = Generated.handPivots(width);
            var hour = WatchUi.loadResource(Rez.Drawables.HandHour) as BitmapResource;
            // Watches whose resource compiler cannot keep PNG alpha get a 1x1 placeholder
            // instead of hand bitmaps (tools/export-assets.mjs) and keep polygon hands.
            if (pivots != null && hour.getWidth() > 1) {
                Hands.setupSmooth(hour,
                    WatchUi.loadResource(Rez.Drawables.HandMinute) as BitmapResource,
                    WatchUi.loadResource(Rez.Drawables.HandSeconds) as BitmapResource,
                    pivots, Generated.handBitmapScale());
                smooth = true;
                // Hand shadows go with the image hands (awake view only: the always-on
                // view draws its own hands without them).
                var shadowPivots = Generated.shadowPivots(width);
                var shadowOffsets = Generated.shadowOffsets(width);
                if (shadowPivots != null && shadowOffsets != null) {
                    Hands.setupShadows([
                        WatchUi.loadResource(Rez.Drawables.ShadowDay) as BitmapResource,
                        WatchUi.loadResource(Rez.Drawables.ShadowWeek) as BitmapResource,
                        WatchUi.loadResource(Rez.Drawables.ShadowHour) as BitmapResource,
                        WatchUi.loadResource(Rez.Drawables.ShadowMinute) as BitmapResource,
                        WatchUi.loadResource(Rez.Drawables.ShadowSeconds) as BitmapResource,
                    ] as Array<BitmapResource>, shadowPivots, shadowOffsets);
                }
            }
        }
        var stats = System.getSystemStats();
        System.println("screen " + width + ", burn-in protection " + _burnInProtection
            + ", bitmap hands " + smooth + ", shadows " + Hands.shadows
            + ", memory after bitmaps: " + stats.usedMemory + " / " + stats.totalMemory);
    }

    // Rotated hand bitmaps need drawBitmap2 with bilinear filtering (API 4.2.1) and run
    // only where the beat runs (AMOLED). Which watches actually get hand bitmaps rather
    // than the placeholder is decided per device in tools/export-assets.mjs.
    private function smoothHandsSupported(dc as Dc) as Boolean {
        return beatSupported() && (dc has :drawBitmap2) && (Graphics has :AffineTransform)
            && (Graphics has :FILTER_MODE_BILINEAR);
    }

    function onUpdate(dc as Dc) as Void {
        var now = Time.now();
        var info = Gregorian.info(now, Time.FORMAT_SHORT);
        var hour = info.hour as Number;
        var min = info.min as Number;
        var sec = info.sec as Number;
        var year = info.year as Number;
        var month = info.month as Number;
        var day = info.day as Number;
        var dayOfWeek = info.day_of_week as Number;
        // Seconds with the eighth-of-a-second fraction where the beat is supported, so
        // the hour and minute hands creep forward with every beat like geared hands
        // instead of stepping once a second. Elsewhere plain whole seconds.
        var secF = beatSupported() ? preciseSeconds(sec, now) : sec * 1.0;
        var hourAngle = ((hour % 12) + min / 60.0 + secF / 3600.0) * 30.0;
        var minuteAngle = (min + secF / 60.0) * 6.0;
        var dayTarget = Calendar.dayHandAngle(dayOfWeek);
        var weekTarget = Calendar.weekHandAngle(year, month, day, dayOfWeek);
        var dayAngle = dayTarget;
        var weekAngle = weekTarget;

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
            // Always-on view: the dial inverted to grey on black, the date window and
            // the pointers and hands on top, no seconds. Nothing moves between minutes:
            // these screens are judged on luminance, not on how long a pixel stays lit,
            // and a shifting frame cut the dial's edge. The dial brightness is set in
            // tools/export-assets.mjs to stay under Garmin's 10% luminance budget.
            if (day != _dateAodDay) {
                _dateAod = null;
                _dateAod = WatchUi.loadResource(Generated.dateAodBitmapId(day)) as BitmapResource;
                _dateAodDay = day;
            }
            resetGlides();
            dc.setColor(Graphics.COLOR_BLACK, Graphics.COLOR_BLACK);
            dc.clear();
            dc.drawBitmap(0, 0, _dialAod as BitmapResource);
            dc.drawBitmap(_dateX, _dateY, _dateAod as BitmapResource);
            Hands.drawAod(dc, dayAngle, weekAngle, hourAngle, minuteAngle);
            return;
        }

        if (day != _dateDay) {
            _date = null;
            _date = WatchUi.loadResource(Generated.dateBitmapId(day)) as BitmapResource;
            _dateDay = day;
        }

        dc.drawBitmap(0, 0, _dial as BitmapResource);
        dc.drawBitmap(_dateX, _dateY, _date as BitmapResource);

        if (!lowPower && Hands.smooth) {
            var nowMs = System.getTimer();
            dayAngle = glided(_dayGlide, _dayShown, dayTarget, nowMs);
            weekAngle = glided(_weekGlide, _weekShown, weekTarget, nowMs);
            _dayShown = dayTarget;
            _weekShown = weekTarget;
            updateGlideTimer();
        } else {
            resetGlides();
        }

        // Stacking order matches the web app: day, week, hour, minute, seconds.
        Hands.drawDay(dc, dayAngle);
        Hands.drawWeek(dc, weekAngle);
        Hands.drawHour(dc, hourAngle);
        Hands.drawMinute(dc, minuteAngle);
        if (lowPower) {
            // Low-power mode redraws once a minute, so the seconds hand would be wrong.
            Hands.drawHub(dc);
        } else {
            Hands.drawSeconds(dc, secF * 6.0);
        }
    }

    // The beating seconds hand runs only where it was built and tested: AMOLED
    // watches that report their display mode (API 5+). Those also let us check
    // for high power before starting the timer, which older devices cannot.
    private function beatSupported() as Boolean {
        return _burnInProtection && (System has :getDisplayMode);
    }

    // Seconds in eighths: the clock gives whole seconds; the millisecond timer,
    // anchored to the clock boundary by _phaseMs, gives how far into the second
    // we are. Drives the seconds hand and the slow creep of the other two hands.
    private function preciseSeconds(sec as Number, now as Time.Moment) as Float {
        var d = System.getTimer().toLong() - now.value().toLong() * 1000l;
        if (d < _phaseMs) {
            _phaseMs = d;
        }
        var beats = ((d - _phaseMs) / BEAT_MS).toNumber();
        if (beats > BEATS_PER_SECOND - 1) {
            beats = BEATS_PER_SECOND - 1;
        }
        return sec + beats / (BEATS_PER_SECOND * 1.0);
    }

    function onBeat() as Void {
        WatchUi.requestUpdate();
    }

    // The angle to draw for a pointer whose target is `target`: when the target moved
    // since the last awake frame (`shown`), a glide starts from the angle on screen.
    private function glided(glide as Glide, shown as Float?, target as Float, nowMs as Number) as Float {
        if (shown != null && (shown as Float) != target) {
            glide.start(glide.angle(shown as Float, nowMs), target, nowMs);
        }
        return glide.angle(target, nowMs);
    }

    function onGlideTick() as Void {
        WatchUi.requestUpdate();
    }

    // Runs the 20 Hz timer only while a glide is in progress, and only awake in high
    // power, like the beat timer.
    private function updateGlideTimer() as Void {
        var active = _dayGlide.isActive() || _weekGlide.isActive();
        if (active && _glideTimer == null && _awake && (System has :getDisplayMode)
                && System.getDisplayMode() == System.DISPLAY_MODE_HIGH_POWER) {
            _glideTimer = new Timer.Timer();
            (_glideTimer as Timer.Timer).start(method(:onGlideTick), GLIDE_TICK_MS, true);
        } else if (!active && _glideTimer != null) {
            (_glideTimer as Timer.Timer).stop();
            _glideTimer = null;
        }
    }

    // Forget the pointer positions: the next awake frame draws them where they belong,
    // without a glide. Used around sleep and when the face is hidden.
    private function resetGlides() as Void {
        _dayGlide.stop();
        _weekGlide.stop();
        _dayShown = null;
        _weekShown = null;
        if (_glideTimer != null) {
            (_glideTimer as Timer.Timer).stop();
            _glideTimer = null;
        }
    }

    private function startBeat() as Void {
        if (_beat != null || !_awake || !beatSupported()) {
            return;
        }
        if (System.getDisplayMode() != System.DISPLAY_MODE_HIGH_POWER) {
            return;
        }
        _beat = new Timer.Timer();
        (_beat as Timer.Timer).start(method(:onBeat), BEAT_MS, true);
    }

    private function stopBeat() as Void {
        if (_beat != null) {
            (_beat as Timer.Timer).stop();
            _beat = null;
        }
    }

    function onShow() as Void {
        startBeat();
    }

    function onHide() as Void {
        stopBeat();
        resetGlides();
    }

    function onExitSleep() as Void {
        _awake = true;
        resetGlides();
        startBeat();
        WatchUi.requestUpdate();
    }

    function onEnterSleep() as Void {
        _awake = false;
        stopBeat();
        resetGlides();
        WatchUi.requestUpdate();
    }

}
