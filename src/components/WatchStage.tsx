import { useState } from "react";

import { Watch3D } from "@/components/Watch3D";
import { WeeklyCalendarWatch } from "@/components/WeeklyCalendarWatch";

type Props = {
  screensaver?: boolean;
};

export function WatchStage({ screensaver = false }: Props) {
  const [view, setView] = useState<"dial" | "3d">("dial");

  return (
    <div
      className={`flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-[#f1e9e0] ${
        screensaver ? "p-0" : "p-3 sm:p-4"
      }`}
    >
      {!screensaver && (
        <button
          type="button"
          aria-pressed={view === "3d"}
          title={view === "dial" ? "Switch to the 3D view" : "Switch to the 2D view"}
          onClick={() => setView((current) => (current === "dial" ? "3d" : "dial"))}
          className="fixed right-3 top-3 z-40 rounded-lg border-2 border-white/40 bg-white px-4 py-2 text-sm font-semibold text-black shadow-lg transition hover:bg-zinc-100 active:scale-95"
        >
          {view === "dial" ? "3D" : "2D"}
        </button>
      )}
      {view === "dial" ? (
        <WeeklyCalendarWatch
          screensaver={screensaver}
          className={
            screensaver
              ? "h-auto w-[min(94vw,94vh)] max-w-none"
              : "h-auto w-full max-w-[min(96vw,720px)]"
          }
        />
      ) : (
        <Watch3D className="fixed inset-0" />
      )}
    </div>
  );
}
