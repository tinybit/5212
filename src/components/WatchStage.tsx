import { WeeklyCalendarWatch } from "@/components/WeeklyCalendarWatch";

type Props = {
  screensaver?: boolean;
};

export function WatchStage({ screensaver = false }: Props) {
  return (
    <div
      className={`flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-[#f1e9e0] ${
        screensaver ? "p-0" : "p-3 sm:p-4"
      }`}
    >
      <WeeklyCalendarWatch
        screensaver={screensaver}
        className={
          screensaver
            ? "h-auto w-[min(94vw,94vh)] max-w-none"
            : "h-auto w-full max-w-[min(96vw,720px)]"
        }
      />
    </div>
  );
}
