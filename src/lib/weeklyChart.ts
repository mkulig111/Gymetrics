export type DayBucket = { date: Date; label: string };

const DAY_ABBR = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function buildWeekDays(): DayBucket[] {
  const today = startOfDay(new Date());
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today);
    date.setDate(date.getDate() - (6 - i));
    return { date, label: i === 6 ? "Today" : DAY_ABBR[date.getDay()] };
  });
}

export function bucketValuesByDay(
  entries: { date: Date; value: number }[],
  days: DayBucket[],
): (number | null)[] {
  const values: (number | null)[] = days.map(() => null);
  for (const e of entries) {
    const day = startOfDay(e.date).getTime();
    const idx = days.findIndex((d) => d.date.getTime() === day);
    if (idx !== -1) values[idx] = e.value;
  }
  return values;
}

export function weekRangeLabel(days: DayBucket[]): string {
  const fmt = (d: Date) => d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  return `${fmt(days[0].date)} - ${fmt(days[days.length - 1].date)}`;
}
