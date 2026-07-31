"use client";

import { useState, useTransition } from "react";
import { getMuscleVolumeReport, MuscleVolumeInterval } from "@/lib/actions/progress";

type Report = Awaited<ReturnType<typeof getMuscleVolumeReport>>;

const INTERVALS: { value: MuscleVolumeInterval; label: string }[] = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
];

// Roll detailed muscle names up into 7 main body-part groups
const MUSCLE_TO_GROUP: Record<string, string> = {
  Chest: "Chest",
  Back: "Back",
  Traps: "Back",
  Shoulders: "Shoulders",
  Biceps: "Arms",
  Triceps: "Arms",
  Forearms: "Arms",
  Quadriceps: "Legs",
  Hamstrings: "Legs",
  Calves: "Legs",
  Glutes: "Glutes",
  Core: "Core",
  "Lower Back": "Core",
  Hips: "Core",
};

const GROUP_ORDER = ["Chest", "Back", "Shoulders", "Arms", "Legs", "Glutes", "Core"] as const;

const GROUP_COLORS: Record<string, string> = {
  Chest: "#3b82f6",
  Back: "#22c55e",
  Shoulders: "#a855f7",
  Arms: "#f97316",
  Legs: "#06b6d4",
  Glutes: "#ec4899",
  Core: "#eab308",
};

function aggregateGroups(muscleVolume: { muscle: string; volume: number }[]) {
  const map = new Map<string, number>();
  for (const { muscle, volume } of muscleVolume) {
    const group = MUSCLE_TO_GROUP[muscle];
    if (!group) continue;
    map.set(group, (map.get(group) ?? 0) + volume);
  }
  return GROUP_ORDER.filter((g) => map.has(g)).map((g) => ({ group: g, volume: map.get(g)! }));
}

function polarXY(cx: number, cy: number, r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcPath(cx: number, cy: number, r: number, startDeg: number, endDeg: number) {
  if (endDeg - startDeg >= 359.99) {
    return `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx - 0.001} ${cy - r} Z`;
  }
  const s = polarXY(cx, cy, r, startDeg);
  const e = polarXY(cx, cy, r, endDeg);
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y} Z`;
}

function PieChart({ groups }: { groups: { group: string; volume: number }[] }) {
  const total = groups.reduce((s, g) => s + g.volume, 0);
  const cx = 100;
  const cy = 100;
  const r = 88;
  let angle = 0;

  return (
    <svg viewBox="0 0 200 200" className="mx-auto w-44">
      {groups.map(({ group, volume }) => {
        const sweep = (volume / total) * 360;
        const d = arcPath(cx, cy, r, angle, angle + sweep);
        angle += sweep;
        return <path key={group} d={d} fill={GROUP_COLORS[group] ?? "#888"} />;
      })}
    </svg>
  );
}

function formatDate(d: Date) {
  return new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
function formatRange(report: Report) {
  if (report.interval === "daily") return formatDate(report.rangeEnd);
  return `${formatDate(report.rangeStart)} – ${formatDate(report.rangeEnd)}`;
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

  const groups = aggregateGroups(report.muscleVolume);
  const total = groups.reduce((s, g) => s + g.volume, 0);

  return (
    <div className="rounded-xl bg-surface p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-bold">Muscle Volume</h2>
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

        {groups.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted">
            No completed sets in this period yet.
          </p>
        ) : (
          <>
            <PieChart groups={groups} />
            <div className="mt-4 space-y-2">
              {groups.map(({ group, volume }) => (
                <div key={group} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-3 w-3 flex-shrink-0 rounded-full"
                      style={{ backgroundColor: GROUP_COLORS[group] }}
                    />
                    <span>{group}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold">{Math.round(volume)}</span>
                    <span className="w-9 text-right text-muted">
                      {Math.round((volume / total) * 100)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
