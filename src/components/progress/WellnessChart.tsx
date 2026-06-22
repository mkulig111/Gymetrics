"use client";

import { addWellnessEntry } from "@/lib/actions/progress";
import ReadinessMetricCard from "./ReadinessMetricCard";

type Entry = { id: string; date: Date; score: number };

export default function WellnessChart({ entries }: { entries: Entry[] }) {
  return (
    <ReadinessMetricCard
      title="Subjective Wellness"
      unit="pts"
      decimals={0}
      step="1"
      entries={entries.map((e) => ({ id: e.id, date: e.date, value: e.score }))}
      onAdd={addWellnessEntry}
      hint="Each morning, rate sleep, soreness, fatigue and mood 1-5 and sum them to build a readiness baseline."
    />
  );
}
