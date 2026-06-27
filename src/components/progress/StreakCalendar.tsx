"use client";

import { useMemo, useState } from "react";
import { buildStreakGrid, computeWeekStreak } from "@/lib/streak";

const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];
const WEEKS_PER_PAGE = 5;

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function formatDate(d: Date) {
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function pageAnchor(weeksBack: number) {
  const d = startOfDay(new Date());
  d.setDate(d.getDate() - weeksBack * 7 * WEEKS_PER_PAGE);
  return d;
}

export default function StreakCalendar({ workoutDates }: { workoutDates: Date[] }) {
  const [weeksBack, setWeeksBack] = useState(0);
  const streak = computeWeekStreak(workoutDates);

  const weeks = useMemo(
    () => buildStreakGrid(workoutDates, WEEKS_PER_PAGE, pageAnchor(weeksBack)),
    [workoutDates, weeksBack],
  );

  const earliestDate = useMemo(() => {
    if (workoutDates.length === 0) return null;
    return workoutDates.reduce((min, d) => (d < min ? d : min), workoutDates[0]);
  }, [workoutDates]);

  function jumpToEarliest() {
    if (!earliestDate) return;
    const target = startOfDay(earliestDate).getTime();
    let w = 0;
    while (w < 1000) {
      const grid = buildStreakGrid(workoutDates, WEEKS_PER_PAGE, pageAnchor(w));
      if (grid[0][0].date.getTime() <= target) break;
      w++;
    }
    setWeeksBack(w);
  }

  const rangeStart = weeks[0][0].date;
  const rangeEnd = weeks[weeks.length - 1][6].date;

  return (
    <div className="rounded-xl bg-surface p-4">
      <p className="mb-3 text-lg font-bold">
        <span className="text-accent">{streak}</span> Week Streak 🔥
      </p>
      <div className="mb-2 flex items-center justify-between">
        <button
          onClick={() => setWeeksBack((w) => w + 1)}
          className="text-xs text-muted hover:text-accent"
          aria-label="Show older weeks"
        >
          ← Older
        </button>
        <span className="text-xs text-muted">
          {formatDate(rangeStart)} - {formatDate(rangeEnd)}
        </span>
        <button
          onClick={() => setWeeksBack((w) => Math.max(0, w - 1))}
          disabled={weeksBack === 0}
          className={`text-xs ${weeksBack === 0 ? "text-muted opacity-30" : "text-muted hover:text-accent"}`}
          aria-label="Show newer weeks"
        >
          Newer →
        </button>
      </div>
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
      {earliestDate && weeksBack === 0 && (
        <button
          onClick={jumpToEarliest}
          className="mt-2 text-xs text-muted underline hover:text-accent"
        >
          Jump to first workout
        </button>
      )}
    </div>
  );
}
