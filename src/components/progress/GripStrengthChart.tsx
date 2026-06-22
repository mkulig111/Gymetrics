"use client";

import { addGripStrengthEntry } from "@/lib/actions/progress";
import ReadinessMetricCard from "./ReadinessMetricCard";

type Entry = { id: string; date: Date; kg: number };

export default function GripStrengthChart({ entries }: { entries: Entry[] }) {
  return (
    <ReadinessMetricCard
      title="Grip Strength"
      unit="kg"
      entries={entries.map((e) => ({ id: e.id, date: e.date, value: e.kg }))}
      onAdd={addGripStrengthEntry}
      hint="Log your grip strength each morning (rested, same position, best of 3 reps) to build a readiness baseline."
    />
  );
}
