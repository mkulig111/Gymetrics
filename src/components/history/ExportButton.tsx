"use client";

import { useState } from "react";
import { IconDownload } from "@tabler/icons-react";
import { getExportData } from "@/lib/actions/history";

function toDateInput(d: Date) {
  return d.toISOString().slice(0, 10);
}

function csvCell(val: unknown): string {
  if (val === null || val === undefined) return "";
  const s = String(val);
  return s.includes(",") || s.includes('"') || s.includes("\n")
    ? `"${s.replace(/"/g, '""')}"`
    : s;
}

export default function ExportButton() {
  const today = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(today.getDate() - 30);

  const [from, setFrom] = useState(toDateInput(thirtyDaysAgo));
  const [to, setTo] = useState(toDateInput(today));
  const [loading, setLoading] = useState(false);

  async function handleExport() {
    setLoading(true);
    try {
      const sessions = await getExportData(from, to);

      const header = ["Date", "Workout", "Exercise", "Set", "Type", "Weight (kg)", "Reps", "Seconds", "Completed", "PR"];
      const rows: string[] = [header.join(",")];

      for (const s of sessions) {
        const date = new Date(s.startedAt).toISOString().slice(0, 10);
        for (const e of s.exercises) {
          for (const set of e.sets) {
            rows.push([
              csvCell(date),
              csvCell(s.routineName),
              csvCell(e.exercise.name),
              csvCell(set.setIndex + 1),
              csvCell(set.type),
              csvCell(set.weightKg),
              csvCell(set.reps),
              csvCell(set.seconds),
              csvCell(set.completed ? "yes" : "no"),
              csvCell(set.isPr ? "yes" : "no"),
            ].join(","));
          }
        }
      }

      const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `gymetrics_${from}_${to}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <input
        type="date"
        value={from}
        onChange={(e) => setFrom(e.target.value)}
        className="rounded-lg border border-border bg-surface-2 px-2 py-1 text-xs outline-none focus:border-accent"
      />
      <span className="text-xs text-muted">–</span>
      <input
        type="date"
        value={to}
        onChange={(e) => setTo(e.target.value)}
        className="rounded-lg border border-border bg-surface-2 px-2 py-1 text-xs outline-none focus:border-accent"
      />
      <button
        onClick={handleExport}
        disabled={loading}
        className="flex items-center gap-1.5 rounded-full bg-surface-2 px-3 py-1.5 text-xs font-semibold hover:bg-border disabled:opacity-50"
      >
        <IconDownload className="h-3.5 w-3.5" stroke={1.5} />
        {loading ? "Exporting…" : "CSV"}
      </button>
    </div>
  );
}
