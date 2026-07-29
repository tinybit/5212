import { WeeklyCalendarWatch } from "@/components/WeeklyCalendarWatch";

export function WatchStage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-black p-3 sm:p-4">
      <WeeklyCalendarWatch className="h-auto w-full max-w-[min(96vw,720px)]" />
    </div>
  );
}
