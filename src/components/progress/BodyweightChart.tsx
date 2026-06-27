"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addBodyweightEntry } from "@/lib/actions/progress";
import WeeklyTrendChart from "@/components/progress/WeeklyTrendChart";
import { buildWeekDays, bucketValuesByDay, weekRangeLabel } from "@/lib/weeklyChart";

type Entry = { id: string; date: Date; weightKg: number };

export default function BodyweightChart({ entries }: { entries: Entry[] }) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [weight, setWeight] = useState("");

  const latest = entries[entries.length - 1];

  async function handleAdd() {
    const num = parseFloat(weight);
    if (!num) return;
    await addBodyweightEntry(num);
    setWeight("");
    setShowForm(false);
    router.refresh();
  }

  const days = buildWeekDays();
  const values = bucketValuesByDay(entries.map((e) => ({ date: e.date, value: e.weightKg })), days);
  const present = values.filter((v): v is number => v !== null);
  const weekAvg = present.length ? present.reduce((sum, v) => sum + v, 0) / present.length : null;
  const headerValue = weekAvg ?? latest?.weightKg ?? null;
  const headerLabel = weekAvg !== null ? "Average" : "Latest";

  return (
    <div className="rounded-xl bg-surface p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-bold">Bodyweight</h2>
        <button
          onClick={() => setShowForm((v) => !v)}
          aria-label="Add bodyweight entry"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-2 text-lg text-accent hover:bg-border"
        >
          +
        </button>
      </div>

      {showForm && (
        <div className="mb-3 flex gap-2">
          <input
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="kg"
            type="number"
            className="flex-1 rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-accent"
          />
          <button onClick={handleAdd} className="rounded-full bg-accent px-4 py-2 text-sm font-bold text-black">
            Save
          </button>
        </div>
      )}

      {entries.length === 0 ? (
        <p className="text-sm text-muted">No entries yet. Log your weight to track progress.</p>
      ) : (
        <>
          <div className="mb-2 flex items-end justify-between">
            <div>
              <p className="text-xs text-muted">{headerLabel}</p>
              <p className="text-2xl font-bold">
                {headerValue!.toFixed(1)} <span className="text-base text-muted">kg</span>
              </p>
            </div>
            <p className="text-xs text-muted">{weekRangeLabel(days)}</p>
          </div>
          <WeeklyTrendChart values={values} days={days} />
        </>
      )}
    </div>
  );
}
