"use client";

import { useState, useTransition } from "react";
import { getMuscleVolumeReport, MuscleVolumeInterval } from "@/lib/actions/progress";

type Report = Awaited<ReturnType<typeof getMuscleVolumeReport>>;

const INTERVALS: { value: MuscleVolumeInterval; label: string }[] = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
];

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

// Short labels for the x-axis
const GROUP_LABEL: Record<string, string> = {
  Chest: "Chest",
  Back: "Back",
  Shoulders: "Shld",
  Arms: "Arms",
  Legs: "Legs",
  Glutes: "Glut",
  Core: "Core",
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

// Pareto chart: bars sorted descending + cumulative % line
function ParetoChart({ groups }: { groups: { group: string; volume: number }[] }) {
  const sorted = [...groups].sort((a, b) => b.volume - a.volume);
  const total = sorted.reduce((s, g) => s + g.volume, 0);
  const maxVol = sorted[0]?.volume ?? 1;
  const n = sorted.length;

  // Layout
  const W = 300, H = 185;
  const mt = 12, mb = 38, ml = 8, mr = 32;
  const cw = W - ml - mr;
  const ch = H - mt - mb;
  const gap = 5;
  const barW = (cw - gap * (n - 1)) / n;

  // Cumulative line points (right edge of each bar, after accumulating that bar's %)
  let cum = 0;
  const linePoints: { x: number; y: number; pct: number }[] = sorted.map((g, i) => {
    cum += (g.volume / total) * 100;
    return {
      x: ml + i * (barW + gap) + barW,
      y: mt + ch * (1 - cum / 100),
      pct: cum,
    };
  });

  const polyline = linePoints.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");

  // Right-axis % guide lines: 25, 50, 75, 100
  const pctGuides = [25, 50, 75, 100];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      {/* % guide lines (right axis) */}
      {pctGuides.map((pct) => {
        const gy = mt + ch * (1 - pct / 100);
        return (
          <g key={pct}>
            <line
              x1={ml} y1={gy} x2={W - mr} y2={gy}
              stroke="currentColor" strokeOpacity={0.1} strokeWidth={1}
              strokeDasharray={pct === 100 ? "none" : "3,3"}
            />
            <text x={W - mr + 4} y={gy + 3} fontSize={8} fill="currentColor" fillOpacity={0.45}>
              {pct}%
            </text>
          </g>
        );
      })}

      {/* Bars */}
      {sorted.map((g, i) => {
        const bx = ml + i * (barW + gap);
        const bh = (g.volume / maxVol) * ch;
        const by = mt + ch - bh;
        return (
          <g key={g.group}>
            <rect x={bx} y={by} width={barW} height={bh} fill={GROUP_COLORS[g.group] ?? "#888"} rx={2} />
            {/* value label above bar */}
            <text
              x={bx + barW / 2} y={by - 3}
              textAnchor="middle" fontSize={7} fill="currentColor" fillOpacity={0.7}
            >
              {Math.round(g.volume)}
            </text>
            {/* x-axis label */}
            <text
              x={bx + barW / 2} y={H - mb + 13}
              textAnchor="middle" fontSize={8.5} fill="currentColor" fillOpacity={0.8}
            >
              {GROUP_LABEL[g.group] ?? g.group}
            </text>
          </g>
        );
      })}

      {/* Cumulative line */}
      <polyline points={polyline} fill="none" stroke="#ffffff" strokeWidth={1.5} strokeOpacity={0.6} />

      {/* Cumulative dots + % labels */}
      {linePoints.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r={2.5} fill="#ffffff" fillOpacity={0.85} />
          {/* show % only at last point */}
          {i === linePoints.length - 1 && (
            <text x={p.x - 2} y={p.y - 5} textAnchor="middle" fontSize={7} fill="#ffffff" fillOpacity={0.6}>
              100%
            </text>
          )}
        </g>
      ))}

      {/* x-axis baseline */}
      <line x1={ml} y1={mt + ch} x2={W - mr} y2={mt + ch} stroke="currentColor" strokeOpacity={0.2} strokeWidth={1} />
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
          <ParetoChart groups={groups} />
        )}
      </div>
    </div>
  );
}
