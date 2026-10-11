import Toybox.Graphics;
import Toybox.Lang;
import Toybox.Math;

// The five hands of the 5212, ported from the measured shapes in
// src/components/WeeklyCalendarWatch.tsx. All lengths below are photo pixels
// from the 2911x2683 reference; setup() maps them onto the screen, where the
// dial edge (radius 1030) is the screen edge.
module Hands {

    const R_DIAL_EDGE = 1030.0;

    // Light direction on the dial plane (lightDiskPosition u, v in the web app).
    const LIGHT_U = -0.6664;
    const LIGHT_V = -0.3543;

    // Hour hand.
    const HOUR_TIP = 510.0;
    const HOUR_REAR = -125.0;
    const HOUR_BASE = -15.0;
    const HOUR_HALF_WIDTH = 72.0;
    const HOUR_TIP_HALF_WIDTH = 3.0;

    // Minute hand.
    const MINUTE_TIP = 786.0;
    const MINUTE_REAR = -105.0;
    const MINUTE_BASE = -25.0;
    const MINUTE_HALF_WIDTH = 60.0;

    // Seconds hand (blade, counterweight, hub), measured from the pin at CY = 1331.
    const SECOND_TIP = 795.0;          // 1331 - 536
    const SECOND_NECK = 44.0;          // 1331 - 1287
    const SECOND_TIP_HALF_WIDTH = 3.84912;
    const SECOND_NECK_HALF_WIDTH = 6.29856;
    const SECOND_SHOULDER = -27.0;     // 1331 - 1358
    const SECOND_TAIL_END = -287.0;    // 1331 - 1618
    const SECOND_TAIL_POINT = -312.0;  // 1331 - 1643
    const SECOND_SHOULDER_HALF_WIDTH = 13.5;
    const SECOND_TAIL_END_HALF_WIDTH = 27.0;
    const HUB_RADIUS = 41.36;
    const PIN_RADIUS = 10.0;

    // Week-of-year and day-of-week indicator hands.
    const WEEK_HEAD_RADIUS = 818.0;
    const WEEK_SHAFT_START = 25.0;
    const WEEK_SHAFT_HALF_WIDTH = 6.48;
    const WEEK_HEAD_HALF_LENGTH = 57.0;
    const WEEK_HEAD_HALF_THICKNESS = 11.7;
    const DAY_HEAD_RADIUS = 432.0;
    const DAY_SHAFT_START = 25.0;
    const DAY_SHAFT_HALF_WIDTH = 7.5;
    const DAY_HEAD_HALF_LENGTH = 72.0;
    const DAY_HEAD_HALF_THICKNESS = 11.7;

    // Screen mapping, set by setup().
    var cx = 130.0;
    var cy = 130.0;
    var s = 130.0 / R_DIAL_EDGE;
    // Thin parts would vanish at watch scale; keep every half-width >= 0.75 screen px.
    var minHalfWidth = 0.75 / (130.0 / R_DIAL_EDGE);

    // Colours, set by setup(): the 64-colour MIP palette, or the web app's flat colours.
    var facetLit = 0xAAAAAA;
    var facetDark = 0x000000;
    var weekShaft = 0x000000;
    var dayShaft = 0x555555;
    var weekRed = 0xAA0000;
    var dayRed = 0xAA0000;
    var seconds = 0x000000;
    var hub = 0x000000;
    var pin = 0x555555;

    function setup(width as Number, fullColour as Boolean) as Void {
        cx = width / 2.0;
        cy = width / 2.0;
        s = (width / 2.0) / R_DIAL_EDGE;
        minHalfWidth = 0.75 / s;
        if (fullColour) {
            facetLit = 0x8F908C;
            facetDark = 0x20211F;
            weekShaft = 0x1E1C18;
            dayShaft = 0x4A4947;
            weekRed = 0xB2303A;
            dayRed = 0xAC353E;
            seconds = 0x1A1A19;
            hub = 0x1A1A19;
            pin = 0x777874;
        }
    }

    // A point on a hand: `along` the hand from the pin, `lateral` to its side.
    // Same formula as handPoint() in the web app.
    function pt(sinA as Float, cosA as Float, along as Float, lateral as Float) as Point2D {
        return [cx + (sinA * along + cosA * lateral) * s, cy + (-cosA * along + sinA * lateral) * s];
    }

    function polar(angleDeg as Float, r as Float) as Point2D {
        var a = Math.toRadians(angleDeg);
        return [cx + Math.sin(a) * r * s, cy - Math.cos(a) * r * s];
    }

    function halfWidth(w as Float) as Float {
        return w > minHalfWidth ? w : minHalfWidth;
    }

    // True when the facet on the +lateral side of a hand faces the light.
    function positiveSideLit(sinA as Float, cosA as Float) as Boolean {
        return cosA * LIGHT_U + sinA * LIGHT_V > 0;
    }

    function fill(dc as Dc, color as Number, points as Array<Point2D>) as Void {
        dc.setColor(color, Graphics.COLOR_TRANSPARENT);
        dc.fillPolygon(points);
    }

    function drawHour(dc as Dc, angleDeg as Float) as Void {
        drawHourFaceted(dc, angleDeg, facetLit, facetDark);
    }

    function drawMinute(dc as Dc, angleDeg as Float) as Void {
        drawMinuteFaceted(dc, angleDeg, facetLit, facetDark);
    }

    // Two-facet hour hand: the facet facing the light gets `lit`, the other `dark`.
    // The whole silhouette is filled dark first and the lit facet drawn over it, so the
    // anti-aliased ridge between the facets blends lit over dark; two shapes meeting
    // edge to edge would each fade out there and let the dial show through as a hairline.
    function drawHourFaceted(dc as Dc, angleDeg as Float, lit as Number, dark as Number) as Void {
        var a = Math.toRadians(angleDeg);
        var sn = Math.sin(a);
        var cs = Math.cos(a);
        var rear = pt(sn, cs, HOUR_REAR, 0.0);
        var tip = pt(sn, cs, HOUR_TIP, 0.0);
        var basePos = pt(sn, cs, HOUR_BASE, HOUR_HALF_WIDTH);
        var baseNeg = pt(sn, cs, HOUR_BASE, -HOUR_HALF_WIDTH);
        var tipPos = pt(sn, cs, HOUR_TIP, HOUR_TIP_HALF_WIDTH);
        var tipNeg = pt(sn, cs, HOUR_TIP, -HOUR_TIP_HALF_WIDTH);
        fill(dc, dark, [rear, basePos, tipPos, tipNeg, baseNeg]);
        if (positiveSideLit(sn, cs)) {
            fill(dc, lit, [rear, basePos, tipPos, tip]);
        } else {
            fill(dc, lit, [rear, tip, tipNeg, baseNeg]);
        }
    }

    function drawMinuteFaceted(dc as Dc, angleDeg as Float, lit as Number, dark as Number) as Void {
        var a = Math.toRadians(angleDeg);
        var sn = Math.sin(a);
        var cs = Math.cos(a);
        var rear = pt(sn, cs, MINUTE_REAR, 0.0);
        var tip = pt(sn, cs, MINUTE_TIP, 0.0);
        var basePos = pt(sn, cs, MINUTE_BASE, MINUTE_HALF_WIDTH);
        var baseNeg = pt(sn, cs, MINUTE_BASE, -MINUTE_HALF_WIDTH);
        fill(dc, dark, [rear, basePos, tip, baseNeg]);
        if (positiveSideLit(sn, cs)) {
            fill(dc, lit, [rear, tip, basePos]);
        } else {
            fill(dc, lit, [rear, baseNeg, tip]);
        }
    }

    // Always-on view on AMOLED: the inverted dial bitmap is drawn by the view; this adds
    // dim day/week pointers with muted red heads, the two-facet hour and minute hands
    // (lit facet light grey, shadow facet mid grey so it still reads on black), and the
    // axle pin. No seconds hand: the view redraws once a minute.
    const AOD_HAND_LIT = 0xB4B4B4;
    const AOD_HAND_DARK = 0x505050;
    const AOD_SHAFT = 0x8C8C8C;
    const AOD_RED = 0x8C1A1A;
    const AOD_PIN = 0x262626;

    function drawAod(dc as Dc, dayAngleDeg as Float, weekAngleDeg as Float, hourAngleDeg as Float,
            minuteAngleDeg as Float) as Void {
        drawIndicator(dc, dayAngleDeg, AOD_SHAFT, AOD_RED, DAY_SHAFT_START, DAY_HEAD_RADIUS,
            DAY_SHAFT_HALF_WIDTH, DAY_HEAD_HALF_LENGTH, DAY_HEAD_HALF_THICKNESS);
        drawIndicator(dc, weekAngleDeg, AOD_SHAFT, AOD_RED, WEEK_SHAFT_START, WEEK_HEAD_RADIUS,
            WEEK_SHAFT_HALF_WIDTH, WEEK_HEAD_HALF_LENGTH, WEEK_HEAD_HALF_THICKNESS);
        drawHourFaceted(dc, hourAngleDeg, AOD_HAND_LIT, AOD_HAND_DARK);
        drawMinuteFaceted(dc, minuteAngleDeg, AOD_HAND_LIT, AOD_HAND_DARK);
        // No seconds hand here, so only a small cap: 45% of the seconds-hand cap, with the pin.
        fill(dc, AOD_SHAFT, circle(HUB_RADIUS * 0.45, 20));
        fill(dc, AOD_PIN, circle(PIN_RADIUS * 0.9, 12));
    }

    function drawSeconds(dc as Dc, angleDeg as Float) as Void {
        var a = Math.toRadians(angleDeg);
        var sn = Math.sin(a);
        var cs = Math.cos(a);
        var tipW = halfWidth(SECOND_TIP_HALF_WIDTH);
        var neckW = halfWidth(SECOND_NECK_HALF_WIDTH);
        fill(dc, seconds, [
            pt(sn, cs, SECOND_TIP, -tipW), pt(sn, cs, SECOND_TIP, tipW),
            pt(sn, cs, SECOND_NECK, neckW), pt(sn, cs, SECOND_NECK, -neckW),
        ]);
        fill(dc, seconds, [
            pt(sn, cs, SECOND_SHOULDER, -SECOND_SHOULDER_HALF_WIDTH),
            pt(sn, cs, SECOND_SHOULDER, SECOND_SHOULDER_HALF_WIDTH),
            pt(sn, cs, SECOND_TAIL_END, SECOND_TAIL_END_HALF_WIDTH),
            pt(sn, cs, SECOND_TAIL_POINT, 0.0),
            pt(sn, cs, SECOND_TAIL_END, -SECOND_TAIL_END_HALF_WIDTH),
        ]);
        drawHub(dc);
    }

    // The seconds-hand hub and pin. Drawn alone when the seconds hand is hidden.
    function drawHub(dc as Dc) as Void {
        fill(dc, hub, circle(HUB_RADIUS, 24));
        fill(dc, pin, circle(PIN_RADIUS, 12));
    }

    function drawWeek(dc as Dc, angleDeg as Float) as Void {
        drawIndicator(dc, angleDeg, weekShaft, weekRed, WEEK_SHAFT_START, WEEK_HEAD_RADIUS,
            WEEK_SHAFT_HALF_WIDTH, WEEK_HEAD_HALF_LENGTH, WEEK_HEAD_HALF_THICKNESS);
    }

    function drawDay(dc as Dc, angleDeg as Float) as Void {
        drawIndicator(dc, angleDeg, dayShaft, dayRed, DAY_SHAFT_START, DAY_HEAD_RADIUS,
            DAY_SHAFT_HALF_WIDTH, DAY_HEAD_HALF_LENGTH, DAY_HEAD_HALF_THICKNESS);
    }

    // Thin shaft from the centre plus a red curved head (annularSectorPath() in the web app).
    function drawIndicator(dc as Dc, angleDeg as Float, shaftColor as Number, headColor as Number,
            shaftStart as Float, headRadius as Float, shaftHalfWidth as Float, headHalfLength as Float,
            headHalfThickness as Float) as Void {
        var a = Math.toRadians(angleDeg);
        var sn = Math.sin(a);
        var cs = Math.cos(a);
        var w = halfWidth(shaftHalfWidth);
        fill(dc, shaftColor, [
            pt(sn, cs, shaftStart, -w), pt(sn, cs, headRadius, -w),
            pt(sn, cs, headRadius, w), pt(sn, cs, shaftStart, w),
        ]);

        var halfAngle = Math.toDegrees(headHalfLength / headRadius);
        var outer = headRadius + headHalfThickness;
        var inner = headRadius - headHalfThickness;
        var steps = 8;
        var head = [] as Array<Point2D>;
        for (var i = 0; i <= steps; i++) {
            head.add(polar(angleDeg - halfAngle + 2 * halfAngle * i / steps, outer));
        }
        for (var i = steps; i >= 0; i--) {
            head.add(polar(angleDeg - halfAngle + 2 * halfAngle * i / steps, inner));
        }
        fill(dc, headColor, head);
    }

    function circle(radius as Float, steps as Number) as Array<Point2D> {
        var points = [] as Array<Point2D>;
        for (var i = 0; i < steps; i++) {
            var a = 2 * Math.PI * i / steps;
            points.add([cx + Math.cos(a) * radius * s, cy + Math.sin(a) * radius * s]);
        }
        return points;
    }
}
