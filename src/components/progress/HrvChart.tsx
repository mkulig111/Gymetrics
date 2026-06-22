"use client";

import { addHrvEntry } from "@/lib/actions/progress";
import ReadinessMetricCard from "./ReadinessMetricCard";

type Entry = { id: string; date: Date; rmssd: number };

export default function HrvChart({ entries }: { entries: Entry[] }) {
  return (
    <ReadinessMetricCard
      title="HRV (rMSSD)"
      unit="ms"
      entries={entries.map((e) => ({ id: e.id, date: e.date, value: e.rmssd }))}
      onAdd={addHrvEntry}
      hint="Measure rMSSD each morning, supine, same time (chest strap or phone camera) to build a readiness baseline."
    />
  );
}
