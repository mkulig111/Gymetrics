"use client";

import { useState, useTransition } from "react";
import { getMuscleVolumeReport, MuscleVolumeInterval } from "@/lib/actions/progress";

type Report = Awaited<ReturnType<typeof getMuscleVolumeReport>>;

const INTERVALS: { value: MuscleVolumeInterval; label: string }[] = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
];

function formatDate(d: Date) {
  return new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function formatRange(report: Report) {
  if (report.interval === "daily") return formatDate(report.rangeEnd);
  return `${formatDate(report.rangeStart)} - ${formatDate(report.rangeEnd)}`;
}

export default function MuscleVolumeReport({ initialReport }: { initialReport: Report }) {
  const [report, setReport] = useState(initialReport);
  const [interval, setInterval] = useState<MuscleVolumeInterval>(initialReport.interval);
  const [isPending, startTransition] = useTransition();

  function onIntervalChange(next: MuscleVolumeInterval) {
    setInterval(next);
    startTransition(async () => {
      const r = await getMuscleVolumeReport(next);
      setReport(r);
    });
  }

  const max = Math.max(1, ...report.muscleVolume.map((m) => m.volume));

  return (
    <div className="rounded-xl bg-surface p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-bold">Muscle Volume Report</h2>
        <div className="flex rounded-lg bg-surface-2 p-1">
          {INTERVALS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onIntervalChange(opt.value)}
              className={`rounded-md px-2 py-1 text-xs font-semibold transition-colors ${
                interval === opt.value ? "bg-accent text-black" : "text-muted"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <p className="mb-3 text-xs text-muted">{formatRange(report)}</p>

      <div className={`transition-opacity ${isPending ? "opacity-50" : "opacity-100"}`}>
        <div className="mb-4 grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-xl font-extrabold text-accent">
              {report.totalVolumeKg >= 1000
                ? `${Math.round(report.totalVolumeKg / 1000)}k`
                : Math.round(report.totalVolumeKg)}
            </p>
            <p className="text-xs text-muted">kg Volume</p>
          </div>
          <div>
            <p className="text-xl font-extrabold text-accent">{report.totalSets}</p>
            <p className="text-xs text-muted">Sets</p>
          </div>
          <div>
            <p className="text-xl font-extrabold text-accent">{report.totalReps}</p>
            <p className="text-xs text-muted">Reps</p>
          </div>
        </div>

        {report.muscleVolume.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted">
            No completed sets in this period yet.
          </p>
        ) : (
          <div className="space-y-3">
            {report.muscleVolume.map((m) => (
              <div key={m.muscle}>
                <div className="mb-1 flex justify-between text-sm">
                  <span>{m.muscle}</span>
                  <span className="font-semibold">{Math.round(m.volume)}</span>
                </div>
                <div className="h-2 w-full rounded-full bg-surface-2">
                  <div
                    className="h-2 rounded-full bg-accent"
                    style={{ width: `${(m.volume / max) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
