import Toybox.Lang;
import Toybox.Math;

// One pointer's move from an old angle to a new one: the web dial's 180 ms
// `cubic-bezier(0.2, 0.85, 0.25, 1)` ease-out, stretched to 400 ms because the
// watch redraws at most 20 times a second. Angles are degrees; the move takes
// the short way round.
class Glide {
    const DURATION_MS = 400;

    private var _from as Float = 0.0;
    private var _delta as Float = 0.0;
    private var _startMs as Number = 0;
    private var _active as Boolean = false;

    function start(fromDeg as Float, toDeg as Float, nowMs as Number) as Void {
        var d = toDeg - fromDeg;
        d = d - 360.0 * Math.floor((d + 180.0) / 360.0);
        _from = fromDeg;
        _delta = d;
        _startMs = nowMs;
        _active = true;
    }

    function isActive() as Boolean {
        return _active;
    }

    function stop() as Void {
        _active = false;
    }

    // The angle to draw now on the way to toDeg; ends the glide when its time is up.
    function angle(toDeg as Float, nowMs as Number) as Float {
        if (!_active) {
            return toDeg;
        }
        var p = (nowMs - _startMs) / (DURATION_MS * 1.0);
        if (p >= 1.0) {
            _active = false;
            return toDeg;
        }
        if (p < 0.0) {
            p = 0.0;
        }
        return _from + _delta * ease(p);
    }

    // y of the Bezier curve (0,0) (0.2,0.85) (0.25,1) (1,1) at the parameter whose x is p:
    // the CSS timing function, found by bisection.
    private function ease(p as Float) as Float {
        var lo = 0.0;
        var hi = 1.0;
        var t = p;
        for (var i = 0; i < 12; i++) {
            t = (lo + hi) / 2.0;
            var u = 1.0 - t;
            var x = 3.0 * u * u * t * 0.2 + 3.0 * u * t * t * 0.25 + t * t * t;
            if (x < p) {
                lo = t;
            } else {
                hi = t;
            }
        }
        var u = 1.0 - t;
        return 3.0 * u * u * t * 0.85 + 3.0 * u * t * t + t * t * t;
    }
}
