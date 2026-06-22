import { buildStreakGrid, computeWeekStreak } from "@/lib/streak";

const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

export default function StreakCalendar({ workoutDates }: { workoutDates: Date[] }) {
  const weeks = buildStreakGrid(workoutDates);
  const streak = computeWeekStreak(workoutDates);

  return (
    <div className="rounded-xl bg-surface p-4">
      <p className="mb-3 text-lg font-bold">
        <span className="text-accent">{streak}</span> Week Streak 🔥
      </p>
      <div className="grid grid-cols-7 gap-2 text-center">
        {DAY_LABELS.map((d, i) => (
          <span key={i} className="text-xs text-muted">
            {d}
          </span>
        ))}
        {weeks.map((week, wi) =>
          week.map((day, di) => (
            <span
              key={`${wi}-${di}`}
              className={`mx-auto flex h-6 w-6 items-center justify-center rounded-full ${
                day.hasWorkout ? "bg-muted" : "bg-surface-2"
              } ${day.isToday ? "ring-2 ring-accent" : ""}`}
            />
          )),
        )}
      </div>
    </div>
  );
}
