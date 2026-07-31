"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { IconPencil, IconTrash, IconChevronRight } from "@tabler/icons-react";
import { SetCategory, ProgrammeTemplate, MainLift } from "@/generated/prisma";
import Button from "@/components/ui/Button";
import { advanceProgrammeWeek, archiveProgramme, deleteProgramme } from "@/lib/actions/programmes";

type SchemeEntry = { id: string; percent: number; reps: number; isAmrap: boolean; setOrder: number };
type WeekScheme = { id: string; weekNum: number; entries: SchemeEntry[] };
type CustomScheme = { id: string; category: SetCategory; sets: number; reps: number };
type CustomWeek = { id: string; weekNumber: number; label: string | null; schemes: CustomScheme[] };
type Day = { id: string; dayOfWeek: number; mainLift: MainLift; assistanceCategory: SetCategory };

type Programme = {
  id: string;
  name: string;
  notes: string | null;
  templateType: ProgrammeTemplate;
  currentWeek: number;
  currentCycle: number;
  tmSquat: number | null;
  tmBench: number | null;
  tmDeadlift: number | null;
  tmPress: number | null;
  tmPercentage: number;
  roundingIncrement: number;
  cycleLengthWeeks: number;
  weeks: CustomWeek[];
  days: Day[];
  weekSchemes: WeekScheme[];
};

const CATEGORY_LABEL: Record<SetCategory, string> = { MAIN: "Main", DROP_OFF: "Drop-off", OTHER: "Other" };
const LIFT_LABEL: Record<MainLift, string> = { SQUAT: "Squat", BENCH: "Bench", DEADLIFT: "Deadlift", PRESS: "Press" };
const LIFT_SHORT: Record<MainLift, string> = { SQUAT: "S", BENCH: "B", DEADLIFT: "D", PRESS: "P" };
const TEMPLATE_BADGE: Record<ProgrammeTemplate, string> = { CUSTOM: "Custom", BBB: "BBB", TRIUMVIRATE: "Triumvirate", FSL: "FSL" };

function computeWeight(tm1rm: number | null, tmPct: number, percent: number, rounding: number) {
  if (!tm1rm) return null;
  const tm = tm1rm * (tmPct / 100);
  return Math.round((tm * percent) / 100 / rounding) * rounding;
}

export default function ProgrammeCard({ programme }: { programme: Programme }) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const isStructured = programme.templateType !== ProgrammeTemplate.CUSTOM;

  // Structured: current week scheme
  const currentScheme = isStructured
    ? programme.weekSchemes.find((ws) => ws.weekNum === programme.currentWeek)
    : null;

  // Custom: current week data
  const currentWeekData = !isStructured
    ? programme.weeks.find((w) => w.weekNumber === programme.currentWeek)
    : null;

  const tms: Partial<Record<MainLift, number | null>> = {
    SQUAT: programme.tmSquat,
    BENCH: programme.tmBench,
    DEADLIFT: programme.tmDeadlift,
    PRESS: programme.tmPress,
  };

  const totalWeeks = isStructured
    ? programme.weekSchemes.length || programme.cycleLengthWeeks
    : programme.weeks.length;

  async function handleAdvance() {
    await advanceProgrammeWeek(programme.id);
    router.refresh();
  }

  async function handleDelete() {
    setMenuOpen(false);
    if (!confirm(`Delete programme "${programme.name}"? This cannot be undone.`)) return;
    await deleteProgramme(programme.id);
    router.refresh();
  }

  async function handleArchive() {
    setMenuOpen(false);
    await archiveProgramme(programme.id);
    router.refresh();
  }

  return (
    <div className="rounded-xl bg-surface p-4">
      {/* Header */}
      <div className="mb-1 flex items-start justify-between">
        <div>
          <Link href={`/train/programmes/${programme.id}/edit`} className="text-lg font-bold hover:text-accent">
            {programme.name}
          </Link>
          {programme.templateType !== ProgrammeTemplate.CUSTOM && (
            <span className="ml-2 rounded-full bg-accent/20 px-2 py-0.5 text-xs font-semibold text-accent">
              {TEMPLATE_BADGE[programme.templateType]}
            </span>
          )}
        </div>
        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            onBlur={() => setTimeout(() => setMenuOpen(false), 150)}
            aria-label="Programme options"
            className="flex h-7 w-7 items-center justify-center rounded-md text-lg leading-none text-muted hover:text-foreground"
          >
            ···
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-8 z-20 min-w-[140px] overflow-hidden rounded-lg bg-surface-2 shadow-lg">
              <button
                onClick={handleArchive}
                className="flex w-full items-center gap-2 px-4 py-3 text-sm hover:bg-border"
              >
                Archive
              </button>
              <button
                onClick={handleDelete}
                className="flex w-full items-center gap-2 border-t border-border px-4 py-3 text-sm text-danger hover:bg-border"
              >
                <IconTrash className="h-4 w-4" stroke={1.5} /> Delete
              </button>
            </div>
          )}
        </div>
      </div>

      <p className="mb-3 text-sm text-muted">
        Cycle {programme.currentCycle} · Week {programme.currentWeek} / {totalWeeks || "—"}
      </p>

      {/* Structured: show entries with computed weights per lift */}
      {isStructured && currentScheme && (
        <div className="mb-3 space-y-2">
          {currentScheme.entries.map((entry) => (
            <div key={entry.id} className="rounded-lg bg-surface-2 px-3 py-2">
              <div className="mb-1 text-xs font-semibold text-muted">
                {entry.percent}%{entry.isAmrap ? "+" : ""} × {entry.reps}{entry.isAmrap ? "+" : ""}
              </div>
              <div className="flex flex-wrap gap-x-3 gap-y-0.5">
                {(Object.entries(tms) as [MainLift, number | null][])
                  .filter(([, tm]) => tm != null)
                  .map(([lift, tm]) => {
                    const w = computeWeight(tm, programme.tmPercentage, entry.percent, programme.roundingIncrement);
                    if (!w) return null;
                    return (
                      <span key={lift} className="text-xs">
                        <span className="text-muted">{LIFT_SHORT[lift]} </span>
                        <span className="font-semibold">{w}kg</span>
                      </span>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Custom: show category schemes */}
      {!isStructured && currentWeekData && (
        <div className="mb-3 space-y-1">
          {currentWeekData.label && (
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-accent">
              {currentWeekData.label}
            </p>
          )}
          {currentWeekData.schemes.map((s) => (
            <div key={s.id} className="flex items-center justify-between text-sm">
              <span className="text-muted">{CATEGORY_LABEL[s.category]}</span>
              <span className="font-semibold">{s.sets} × {s.reps}</span>
            </div>
          ))}
        </div>
      )}

      {/* Schedule pills (structured) */}
      {isStructured && programme.days.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-1">
          {programme.days.map((d) => (
            <span key={d.id} className="rounded-full bg-surface-2 px-2 py-0.5 text-xs text-muted">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][d.dayOfWeek]}: {LIFT_LABEL[d.mainLift]}
            </span>
          ))}
        </div>
      )}

      {/* Week progress bar */}
      {totalWeeks > 1 && (
        <div className="mb-3 flex gap-1">
          {Array.from({ length: totalWeeks }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full ${
                i + 1 < programme.currentWeek
                  ? "bg-accent"
                  : i + 1 === programme.currentWeek
                    ? "bg-accent/50"
                    : "bg-surface-2"
              }`}
            />
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <Link
          href={`/train/programmes/${programme.id}/edit`}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-surface-2 px-4 py-2.5 text-sm hover:bg-border"
        >
          <IconPencil className="h-3.5 w-3.5" stroke={1.5} /> Edit
        </Link>
        <Button
          variant="primary"
          className="flex flex-1 items-center justify-center gap-1.5"
          onClick={handleAdvance}
        >
          Week {programme.currentWeek} done <IconChevronRight className="h-3.5 w-3.5" stroke={1.5} />
        </Button>
      </div>
    </div>
  );
}
