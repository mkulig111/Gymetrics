"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addGripStrengthEntry } from "@/lib/actions/progress";

type Entry = { id: string; date: Date; kg: number };

const BASELINE_WINDOW = 7;
const BASELINE_MIN = 3;

function mean(values: number[]) {
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

export default function GripStrengthChart({ entries }: { entries: Entry[] }) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [kg, setKg] = useState("");

  const latest = entries[entries.length - 1];
  const baselineCount = Math.min(BASELINE_WINDOW, entries.length);
  const baselineEntries = entries.slice(0, baselineCount);
  const baselineMean = baselineEntries.length >= BASELINE_MIN ? mean(baselineEntries.map((e) => e.kg)) : null;
  const hasReadingPastBaseline = entries.length > baselineCount;

  let readiness: { label: string; pctDrop: number; color: string } | null = null;
  if (baselineMean !== null && hasReadingPastBaseline && latest) {
    const pctDrop = ((baselineMean - latest.kg) / baselineMean) * 100;
    if (pctDrop < 5) {
      readiness = { label: "Normal", pctDrop, color: "text-green-400" };
    } else if (pctDrop <= 10) {
      readiness = { label: "Under-recovered", pctDrop, color: "text-yellow-400" };
    } else {
      readiness = { label: "Fatigued", pctDrop, color: "text-red-400" };
    }
  }

  async function handleAdd() {
    const num = parseFloat(kg);
    if (!num) return;
    await addGripStrengthEntry(num);
    setKg("");
    setShowForm(false);
    router.refresh();
  }

  const width = 280;
  const height = 100;
  const values = entries.map((e) => e.kg);
  const min = Math.min(...values, latest?.kg ?? 0);
  const max = Math.max(...values, latest?.kg ?? 1);
  const range = max - min || 1;

  const points = entries.map((e, i) => {
    const x = entries.length > 1 ? (i / (entries.length - 1)) * width : width / 2;
    const y = height - ((e.kg - min) / range) * height;
    return `${x},${y}`;
  });

  return (
    <div className="rounded-xl bg-surface p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-bold">Grip Strength</h2>
        <button onClick={() => setShowForm((v) => !v)} className="text-xl text-accent">
          +
        </button>
      </div>

      {showForm && (
        <div className="mb-3 flex gap-2">
          <input
            value={kg}
            onChange={(e) => setKg(e.target.value)}
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
        <p className="text-sm text-muted">
          Log your grip strength each morning (rested, same position, best of 3 reps) to build a readiness baseline.
        </p>
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
            {latest.kg.toFixed(1)} <span className="text-base text-muted">kg</span>
          </p>

          {baselineMean === null ? (
            <p className="mt-1 text-xs text-muted">
              {BASELINE_MIN - baselineEntries.length} more morning measurement(s) needed to set a baseline.
            </p>
          ) : readiness ? (
            <p className="mt-1 text-xs">
              <span className={`font-bold ${readiness.color}`}>{readiness.label}</span>
              <span className="text-muted">
                {" "}
                — {readiness.pctDrop >= 0 ? "down" : "up"} {Math.abs(readiness.pctDrop).toFixed(1)}% vs baseline (
                {baselineMean.toFixed(1)} kg)
              </span>
            </p>
          ) : (
            <p className="mt-1 text-xs text-muted">Baseline set at {baselineMean.toFixed(1)} kg.</p>
          )}
        </>
      )}
    </div>
  );
}
