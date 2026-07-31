"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { IconPencil, IconTrash, IconChevronRight } from "@tabler/icons-react";
import { SetCategory } from "@/generated/prisma";
import Button from "@/components/ui/Button";
import { advanceProgrammeWeek, archiveProgramme, deleteProgramme } from "@/lib/actions/programmes";

type Scheme = { id: string; category: SetCategory; sets: number; reps: number };
type Week = { id: string; weekNumber: number; label: string | null; schemes: Scheme[] };
type Programme = {
  id: string;
  name: string;
  notes: string | null;
  currentWeek: number;
  weeks: Week[];
};

const CATEGORY_LABEL: Record<SetCategory, string> = {
  MAIN: "Main",
  DROP_OFF: "Drop-off",
  OTHER: "Other",
};

export default function ProgrammeCard({ programme }: { programme: Programme }) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const currentWeekData = programme.weeks.find((w) => w.weekNumber === programme.currentWeek);
  const totalWeeks = programme.weeks.length;

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
      <div className="mb-1 flex items-start justify-between">
        <Link href={`/train/programmes/${programme.id}/edit`} className="text-lg font-bold hover:text-accent">
          {programme.name}
        </Link>
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
        Week {programme.currentWeek} / {totalWeeks || "—"}
      </p>

      {currentWeekData && (
        <div className="mb-3 space-y-1">
          {currentWeekData.label && (
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-accent">
              {currentWeekData.label}
            </p>
          )}
          {currentWeekData.schemes.map((s) => (
            <div key={s.id} className="flex items-center justify-between text-sm">
              <span className="text-muted">{CATEGORY_LABEL[s.category]}</span>
              <span className="font-semibold">
                {s.sets} × {s.reps}
              </span>
            </div>
          ))}
        </div>
      )}

      {totalWeeks > 1 && (
        <div className="mb-3 flex gap-1">
          {programme.weeks.map((w) => (
            <div
              key={w.id}
              className={`h-1.5 flex-1 rounded-full ${
                w.weekNumber < programme.currentWeek
                  ? "bg-accent"
                  : w.weekNumber === programme.currentWeek
                    ? "bg-accent/50"
                    : "bg-surface-2"
              }`}
            />
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <Link
          href={`/train/programmes/${programme.id}/edit`}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-surface-2 px-4 py-2.5 text-sm hover:bg-border"
        >
          <IconPencil className="h-3.5 w-3.5" stroke={1.5} /> Edit
        </Link>
        <Button variant="primary" className="flex flex-1 items-center justify-center gap-1.5" onClick={handleAdvance}>
          Week {programme.currentWeek} done <IconChevronRight className="h-3.5 w-3.5" stroke={1.5} />
        </Button>
      </div>
    </div>
  );
}
