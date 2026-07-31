import { buildStreakGrid, computeWeekStreak } from "@/lib/streak";

const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

export default function StreakCalendar({
  workoutDates,
}: {
  workoutDates: { date: Date; label: string }[];
}) {
  const weeks = buildStreakGrid(workoutDates);
  const streak = computeWeekStreak(workoutDates);

  return (
    <div className="rounded-xl bg-surface p-4">
      <p className="mb-3 text-lg font-bold">
        <span className="text-accent">{streak}</span> Week Streak 🔥
      </p>
      <div className="grid grid-cols-7 gap-1.5 text-center">
        {DAY_LABELS.map((d, i) => (
          <span key={i} className="text-xs text-muted">
            {d}
          </span>
        ))}
        {weeks.map((week, wi) =>
          week.map((day, di) => {
            const letter = day.labels[0] ?? "";
            return (
              <span
                key={`${wi}-${di}`}
                className={`mx-auto flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold ${
                  day.hasWorkout ? "bg-accent text-black" : "bg-surface-2 text-transparent"
                } ${day.isToday ? "ring-2 ring-accent ring-offset-1 ring-offset-surface" : ""}`}
              >
                {letter}
              </span>
            );
          }),
        )}
      </div>
    </div>
  );
}
