import { r as __toESM } from "../_runtime.mjs";
import { M as require_react, h as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-Dqmaxo3m.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/** ISO week number (1–53) for a given date. */
function getIsoWeek(date) {
	const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
	const dayNum = d.getUTCDay() || 7;
	d.setUTCDate(d.getUTCDate() + 4 - dayNum);
	const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
	return Math.ceil(((d.getTime() - yearStart.getTime()) / 864e5 + 1) / 7);
}
var MONTHS = [
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
	"DECEMBER"
];
var DAYS = [
	"SUNDAY",
	"MONDAY",
	"TUESDAY",
	"WEDNESDAY",
	"THURSDAY",
	"FRIDAY",
	"SATURDAY"
];
/** Angle for week-of-year pointer: week 1 at top, clockwise around 53 positions. */
function weekAngleDeg(week) {
	return (Math.min(53, Math.max(1, week)) - 1) / 53 * 360;
}
/** Angle for day-of-week pointer: Sunday at top, clockwise. */
function dayAngleDeg(dayIndex) {
	return dayIndex / 7 * 360;
}
/** Angle for month pointer: January at top, clockwise. */
function monthAngleDeg(monthIndex) {
	return monthIndex / 12 * 360;
}
function anglesFromDate(now) {
	const ms = now.getMilliseconds();
	const s = now.getSeconds() + ms / 1e3;
	const m = now.getMinutes() + s / 60;
	return {
		hour: (now.getHours() % 12 + m / 60) * 30,
		minute: m * 6,
		second: s * 6,
		week: weekAngleDeg(getIsoWeek(now)),
		day: dayAngleDeg(now.getDay()),
		month: monthAngleDeg(now.getMonth()),
		date: now.getDate(),
		now
	};
}
function r2(n) {
	return Math.round(n * 100) / 100;
}
function polar(cx, cy, r, deg) {
	const rad = (deg - 90) * Math.PI / 180;
	return {
		x: r2(cx + r * Math.cos(rad)),
		y: r2(cy + r * Math.sin(rad))
	};
}
function WeeklyCalendarWatch({ className = "", paused = false, demoDate = null }) {
	const [mounted, setMounted] = (0, import_react.useState)(false);
	const [angles, setAngles] = (0, import_react.useState)(() => anglesFromDate(new Date(2026, 6, 29, 12, 0, 0)));
	(0, import_react.useEffect)(() => {
		setMounted(true);
	}, []);
	(0, import_react.useEffect)(() => {
		if (!mounted) return;
		if (paused && demoDate) {
			setAngles(anglesFromDate(demoDate));
			return;
		}
		let raf = 0;
		const tick = () => {
			setAngles(anglesFromDate(/* @__PURE__ */ new Date()));
			raf = requestAnimationFrame(tick);
		};
		raf = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(raf);
	}, [
		mounted,
		paused,
		demoDate
	]);
	const size = 640;
	const cx = size / 2;
	const cy = size / 2;
	const rCaseOuter = 312;
	const rCaseInner = 298;
	const rDial = 292;
	const rMonth = 268;
	const rWeek = 232;
	const rDay = 168;
	const rHourMarkOuter = 200;
	const rHourMarkInner = 178;
	const weekLabels = (0, import_react.useMemo)(() => {
		const labels = [];
		for (let w = 1; w <= 53; w += 2) labels.push(w);
		return labels;
	}, []);
	const evenWeeks = (0, import_react.useMemo)(() => Array.from({ length: 53 }, (_, i) => i + 1).filter((w) => w % 2 === 0), []);
	const a = angles;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: `0 0 ${size} ${size}`,
		className,
		role: "img",
		"aria-label": "Weekly calendar dial with live time, week, day, month, and date",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("defs", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("radialGradient", {
					id: "caseMetal",
					cx: "35%",
					cy: "30%",
					r: "70%",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
							offset: "0%",
							stopColor: "#f4f4f6"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
							offset: "40%",
							stopColor: "#c8c8cc"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
							offset: "75%",
							stopColor: "#9a9aa0"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
							offset: "100%",
							stopColor: "#6e6e74"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("linearGradient", {
					id: "caseBevel",
					x1: "0%",
					y1: "0%",
					x2: "100%",
					y2: "100%",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
							offset: "0%",
							stopColor: "#ffffff",
							stopOpacity: "0.55"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
							offset: "45%",
							stopColor: "#b8b8bc",
							stopOpacity: "0.2"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
							offset: "100%",
							stopColor: "#404048",
							stopOpacity: "0.55"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("radialGradient", {
					id: "dialFace",
					cx: "48%",
					cy: "42%",
					r: "62%",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
							offset: "0%",
							stopColor: "#faf8f3"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
							offset: "70%",
							stopColor: "#f0ebe2"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
							offset: "100%",
							stopColor: "#e4ddd0"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("linearGradient", {
					id: "handSteel",
					x1: "0%",
					y1: "0%",
					x2: "0%",
					y2: "100%",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
							offset: "0%",
							stopColor: "#4a4a50"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
							offset: "50%",
							stopColor: "#2a2a30"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
							offset: "100%",
							stopColor: "#121216"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("linearGradient", {
					id: "handSteelLight",
					x1: "0%",
					y1: "0%",
					x2: "0%",
					y2: "100%",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
						offset: "0%",
						stopColor: "#6a6a72"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
						offset: "100%",
						stopColor: "#2c2c32"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("filter", {
					id: "softShadow",
					x: "-20%",
					y: "-20%",
					width: "140%",
					height: "140%",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("feDropShadow", {
						dx: "0",
						dy: "4",
						stdDeviation: "6",
						floodColor: "#000",
						floodOpacity: "0.28"
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("filter", {
					id: "handShadow",
					x: "-50%",
					y: "-50%",
					width: "200%",
					height: "200%",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("feDropShadow", {
						dx: "0.5",
						dy: "1.2",
						stdDeviation: "1.2",
						floodColor: "#000",
						floodOpacity: "0.35"
					})
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx,
				cy,
				r: rCaseOuter,
				fill: "url(#caseMetal)",
				filter: "url(#softShadow)"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx,
				cy,
				r: rCaseOuter,
				fill: "url(#caseBevel)",
				opacity: "0.55"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx,
				cy,
				r: rCaseInner,
				fill: "none",
				stroke: "#5a5a62",
				strokeWidth: "1.2",
				opacity: "0.6"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx,
				cy,
				r: rDial,
				fill: "url(#dialFace)"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx,
				cy,
				r: rDial - 1,
				fill: "none",
				stroke: "#cfc8bb",
				strokeWidth: "1.5",
				opacity: "0.8"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx,
				cy,
				r: 278,
				fill: "none",
				stroke: "#d6d0c4",
				strokeWidth: "0.6",
				opacity: "0.7"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx,
				cy,
				r: 500 / 2,
				fill: "none",
				stroke: "#d6d0c4",
				strokeWidth: "0.5",
				opacity: "0.55"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx,
				cy,
				r: rWeek - 6,
				fill: "none",
				stroke: "#d6d0c4",
				strokeWidth: "0.5",
				opacity: "0.55"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx,
				cy,
				r: 176,
				fill: "none",
				stroke: "#d6d0c4",
				strokeWidth: "0.6",
				opacity: "0.6"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx,
				cy,
				r: rDay - 18,
				fill: "none",
				stroke: "#d6d0c4",
				strokeWidth: "0.5",
				opacity: "0.45"
			}),
			MONTHS.map((month, i) => {
				const deg = monthAngleDeg(i);
				const p = polar(cx, cy, rMonth, deg);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
					x: p.x,
					y: p.y,
					textAnchor: "middle",
					dominantBaseline: "middle",
					fill: "#1f1f1f",
					fontFamily: "Inter, system-ui, sans-serif",
					fontSize: "9.5",
					fontWeight: "500",
					letterSpacing: "0.6",
					transform: `rotate(${deg}, ${p.x}, ${p.y})`,
					children: month
				}, month);
			}),
			weekLabels.map((w) => {
				const deg = weekAngleDeg(w);
				const p = polar(cx, cy, rWeek, deg);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
					x: p.x,
					y: p.y,
					textAnchor: "middle",
					dominantBaseline: "middle",
					fill: "#2a2a2a",
					fontFamily: "Inter, system-ui, sans-serif",
					fontSize: "10",
					fontWeight: "500",
					transform: `rotate(${r2(deg)}, ${p.x}, ${p.y})`,
					children: w
				}, w);
			}),
			evenWeeks.map((w) => {
				const deg = weekAngleDeg(w);
				const outer = polar(cx, cy, 240, deg);
				const inner = polar(cx, cy, 235, deg);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
					x1: inner.x,
					y1: inner.y,
					x2: outer.x,
					y2: outer.y,
					stroke: "#8a8478",
					strokeWidth: "0.8",
					opacity: "0.55"
				}, `wt-${w}`);
			}),
			DAYS.map((day, i) => {
				const deg = dayAngleDeg(i);
				const p = polar(cx, cy, rDay, deg);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
					x: p.x,
					y: p.y,
					textAnchor: "middle",
					dominantBaseline: "middle",
					fill: "#2a2a2a",
					fontFamily: "Inter, system-ui, sans-serif",
					fontSize: "8.5",
					fontWeight: "500",
					letterSpacing: "0.4",
					transform: `rotate(${r2(deg)}, ${p.x}, ${p.y})`,
					children: day
				}, day);
			}),
			Array.from({ length: 12 }, (_, i) => {
				const deg = i * 30;
				if (i === 3) return null;
				const outer = polar(cx, cy, rHourMarkOuter, deg);
				const inner = polar(cx, cy, rHourMarkInner, deg);
				const midX = r2((outer.x + inner.x) / 2);
				const midY = r2((outer.y + inner.y) / 2);
				const length = rHourMarkOuter - rHourMarkInner;
				const width = i % 3 === 0 ? 7.5 : 6.2;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
					x: midX - width / 2,
					y: midY - length / 2,
					width,
					height: length,
					rx: 1.2,
					fill: "#1a1a1a",
					transform: `rotate(${deg}, ${midX}, ${midY})`
				}, `hm-${i}`);
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
					x: 468,
					y: cy - 16,
					width: 36,
					height: 32,
					rx: 2.5,
					fill: "#faf8f3",
					stroke: "#1a1a1a",
					strokeWidth: "1.4"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
					x: 470,
					y: cy - 14,
					width: 32,
					height: 28,
					rx: 1.5,
					fill: "#fff",
					stroke: "#cfc8bb",
					strokeWidth: "0.6"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
					x: 486,
					y: 323,
					textAnchor: "middle",
					dominantBaseline: "middle",
					fill: "#1a1a1a",
					fontFamily: "Inter, system-ui, sans-serif",
					fontSize: "18",
					fontWeight: "600",
					children: a.date
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
				x: cx,
				y: cy - 28,
				textAnchor: "middle",
				fill: "#1a1a1a",
				fontFamily: "Cormorant Garamond, Georgia, serif",
				fontSize: "15",
				fontWeight: "600",
				letterSpacing: "2.4",
				children: "ATELIER"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
				x: cx,
				y: cy - 12,
				textAnchor: "middle",
				fill: "#5a5a5a",
				fontFamily: "Inter, system-ui, sans-serif",
				fontSize: "8",
				fontWeight: "400",
				letterSpacing: "3.2",
				children: "GENEVA"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
				x: cx,
				y: 446,
				textAnchor: "middle",
				fill: "#8a8478",
				fontFamily: "Inter, system-ui, sans-serif",
				fontSize: "6.5",
				fontWeight: "400",
				letterSpacing: "1.6",
				children: "SWISS MADE"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
				filter: "url(#handShadow)",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
						transform: `rotate(${r2(a.month)}, ${cx}, ${cy})`,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
							x1: cx,
							y1: 338,
							x2: cx,
							y2: 58,
							stroke: "#3a3a40",
							strokeWidth: "1.4",
							strokeLinecap: "round"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
							cx,
							cy: 66,
							r: "3.2",
							fill: "#c41e1e"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
						transform: `rotate(${r2(a.day)}, ${cx}, ${cy})`,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
							x1: cx,
							y1: 336,
							x2: cx,
							y2: 156,
							stroke: "#2a2a30",
							strokeWidth: "1.6",
							strokeLinecap: "round"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("polygon", {
							points: `${cx},154 ${cx - 3.5},166 323.5,166`,
							fill: "#2a2a30"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
						transform: `rotate(${r2(a.week)}, ${cx}, ${cy})`,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
							x1: cx,
							y1: 342,
							x2: cx,
							y2: 90,
							stroke: "url(#handSteel)",
							strokeWidth: "2",
							strokeLinecap: "round"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
							x: cx - 2.2,
							y: cy - rWeek - 2,
							width: 4.4,
							height: 16,
							rx: 1,
							fill: "#c41e1e"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("g", {
						transform: `rotate(${r2(a.hour)}, ${cx}, ${cy})`,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
							d: `M ${cx - 5.5} 342
                L ${cx - 4} ${cy - 110}
                L ${cx} ${cy - 124}
                L 324 ${cy - 110}
                L 325.5 342
                Z`,
							fill: "url(#handSteel)"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("g", {
						transform: `rotate(${r2(a.minute)}, ${cx}, ${cy})`,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
							d: `M ${cx - 4} 346
                L ${cx - 2.8} ${cy - 150}
                L ${cx} ${cy - 168}
                L 322.8 ${cy - 150}
                L 324 346
                Z`,
							fill: "url(#handSteelLight)"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
						transform: `rotate(${r2(a.second)}, ${cx}, ${cy})`,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
							x1: cx,
							y1: 352,
							x2: cx,
							y2: cy - 175,
							stroke: "#1a1a1a",
							strokeWidth: "0.9",
							strokeLinecap: "round"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
							cx,
							cy: cy - 100,
							r: "3.2",
							fill: "#1a1a1a"
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx,
				cy,
				r: "8",
				fill: "#2a2a30"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx,
				cy,
				r: "4.5",
				fill: "#6a6a72"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx,
				cy,
				r: "2",
				fill: "#1a1a1a"
			})
		]
	});
}
function formatStatus(now) {
	return {
		week: getIsoWeek(now),
		day: DAYS[now.getDay()],
		month: MONTHS[now.getMonth()],
		date: now.getDate(),
		time: now.toLocaleTimeString("en-GB", {
			hour: "2-digit",
			minute: "2-digit",
			second: "2-digit",
			hour12: false
		})
	};
}
var SEED = new Date(2026, 6, 29, 12, 0, 0);
function WatchStage() {
	const [live, setLive] = (0, import_react.useState)(true);
	const [mounted, setMounted] = (0, import_react.useState)(false);
	const [now, setNow] = (0, import_react.useState)(SEED);
	(0, import_react.useEffect)(() => {
		setMounted(true);
		setNow(/* @__PURE__ */ new Date());
	}, []);
	(0, import_react.useEffect)(() => {
		if (!mounted || !live) return;
		const id = window.setInterval(() => setNow(/* @__PURE__ */ new Date()), 1e3);
		return () => window.clearInterval(id);
	}, [live, mounted]);
	const status = formatStatus(now);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-bg px-4 py-8 sm:px-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				"aria-hidden": true,
				className: "pointer-events-none absolute inset-0 watch-ambient"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "relative z-10 mb-6 max-w-lg text-center sm:mb-8",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mb-2 text-xs font-medium uppercase tracking-[0.28em] text-accent",
						children: "Weekly calendar dial"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "font-display text-3xl font-medium tracking-wide text-fg sm:text-4xl",
						children: "Atelier Geneva"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-muted text-balance",
						children: "Live coded face — week of year, day, month, date aperture, and central time."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative z-10 flex w-full max-w-[min(92vw,420px)] flex-col items-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "strap-leather h-16 w-[38%] rounded-t-md shadow-[inset_0_0_0_1px_rgba(0,0,0,0.35),0_4px_12px_rgba(0,0,0,0.4)] sm:h-20" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "relative w-full",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WeeklyCalendarWatch, {
							className: "relative z-10 mx-auto h-auto w-full drop-shadow-[0_24px_48px_rgba(0,0,0,0.55)]",
							paused: !live,
							demoDate: !live ? now : null
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "strap-leather h-20 w-[38%] rounded-b-md shadow-[inset_0_0_0_1px_rgba(0,0,0,0.35),0_8px_20px_rgba(0,0,0,0.45)] sm:h-24" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mt-0.5 h-3 w-[28%] rounded-sm bg-gradient-to-b from-case to-subtle shadow-md" })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative z-10 mt-8 w-full max-w-md",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Readout, {
								label: "Time",
								value: status.time
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Readout, {
								label: "Week",
								value: String(status.week)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Readout, {
								label: "Day",
								value: status.day.slice(0, 3)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Readout, {
								label: "Date",
								value: `${status.month.slice(0, 3)} ${status.date}`
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-5 flex items-center justify-center gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => {
								setLive(true);
								setNow(/* @__PURE__ */ new Date());
							},
							className: `rounded-full px-4 py-2 text-xs font-medium tracking-wide transition-colors ${live ? "bg-accent text-bg" : "bg-surface text-muted ring-1 ring-border hover:text-fg"}`,
							children: "Live"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => {
								setLive(false);
								setNow(/* @__PURE__ */ new Date());
							},
							className: `rounded-full px-4 py-2 text-xs font-medium tracking-wide transition-colors ${!live ? "bg-accent text-bg" : "bg-surface text-muted ring-1 ring-border hover:text-fg"}`,
							children: "Freeze"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-6 text-center text-xs leading-relaxed text-subtle",
						children: "Inspired by classic weekly-calendar complications. Original dial — not affiliated with any brand. Red-tipped hand = ISO week · slender month & day hands · date at 3 o'clock."
					})
				]
			})
		]
	});
}
function Readout({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-xl bg-surface/80 px-3 py-2.5 ring-1 ring-border backdrop-blur-sm",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-[0.65rem] font-medium uppercase tracking-[0.18em] text-subtle",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-0.5 font-mono text-sm tabular-nums text-fg",
			children: value
		})]
	});
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WatchStage, {});
}
//#endregion
export { Home as component };
