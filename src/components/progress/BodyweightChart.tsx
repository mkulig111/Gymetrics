"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addBodyweightEntry } from "@/lib/actions/progress";

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

  const width = 280;
  const height = 100;
  const values = entries.map((e) => e.weightKg);
  const min = Math.min(...values, latest?.weightKg ?? 0);
  const max = Math.max(...values, latest?.weightKg ?? 1);
  const range = max - min || 1;

  const points = entries.map((e, i) => {
    const x = entries.length > 1 ? (i / (entries.length - 1)) * width : width / 2;
    const y = height - ((e.weightKg - min) / range) * height;
    return `${x},${y}`;
  });

  return (
    <div className="rounded-xl bg-surface p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-bold">Bodyweight</h2>
        <button onClick={() => setShowForm((v) => !v)} className="text-xl text-accent">
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
          <button onClick={handleAdd} className="rounded-lg bg-accent px-4 py-2 text-sm font-bold text-black">
            Save
          </button>
        </div>
      )}

      {entries.length === 0 ? (
        <p className="text-sm text-muted">No entries yet. Log your weight to track progress.</p>
      ) : (
        <>
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full" preserveAspectRatio="none">
            <polyline
              points={points.join(" ")}
              fill="none"
              stroke="#f5b700"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {entries.map((e, i) => {
              const [x, y] = points[i].split(",").map(Number);
              return <circle key={e.id} cx={x} cy={y} r={3} fill="#f5b700" />;
            })}
          </svg>
          <p className="mt-2 text-2xl font-bold">
            {latest.weightKg.toFixed(2)} <span className="text-base text-muted">kg</span>
          </p>
        </>
      )}
    </div>
  );
}
