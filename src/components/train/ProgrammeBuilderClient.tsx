"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import { SetCategory } from "@/generated/prisma";
import Button from "@/components/ui/Button";
import {
  addSchemeCategory,
  addWeek,
  deleteProgramme,
  removeSchemeCategory,
  removeWeek,
  updateProgrammeDetails,
  updateScheme,
  updateWeekLabel,
} from "@/lib/actions/programmes";

type Scheme = { id: string; category: SetCategory; sets: number; reps: number };
type Week = { id: string; weekNumber: number; label: string | null; schemes: Scheme[] };

export type ProgrammeData = {
  id: string;
  name: string;
  notes: string | null;
  weeks: Week[];
};

const CATEGORY_LABEL: Record<SetCategory, string> = {
  MAIN: "Main",
  DROP_OFF: "Drop-off",
  OTHER: "Other",
};

const ALL_CATEGORIES = [SetCategory.MAIN, SetCategory.DROP_OFF, SetCategory.OTHER];

export default function ProgrammeBuilderClient({ programme }: { programme: ProgrammeData }) {
  const router = useRouter();
  const [name, setName] = useState(programme.name);
  const [notes, setNotes] = useState(programme.notes ?? "");
  const [weeks, setWeeks] = useState<Week[]>(programme.weeks);
  const [, startTransition] = useTransition();

  function onNameBlur() {
    startTransition(() => updateProgrammeDetails(programme.id, { name, notes }));
  }

  function patchScheme(weekId: string, schemeId: string, patch: Partial<Scheme>) {
    setWeeks((prev) =>
      prev.map((w) =>
        w.id !== weekId
          ? w
          : { ...w, schemes: w.schemes.map((s) => (s.id === schemeId ? { ...s, ...patch } : s)) },
      ),
    );
  }

  function onSchemeCommit(weekId: string, schemeId: string, field: "sets" | "reps", value: string) {
    const num = Math.max(1, parseInt(value) || 1);
    patchScheme(weekId, schemeId, { [field]: num });
    startTransition(() => updateScheme(schemeId, { [field]: num }, programme.id));
  }

  function onLabelBlur(weekId: string, label: string) {
    startTransition(() => updateWeekLabel(weekId, label, programme.id));
  }

  function patchWeekLabel(weekId: string, label: string) {
    setWeeks((prev) => prev.map((w) => (w.id !== weekId ? w : { ...w, label })));
  }

  async function onAddWeek() {
    const created = await addWeek(programme.id);
    setWeeks((prev) => [...prev, created]);
  }

  async function onRemoveWeek(weekId: string) {
    setWeeks((prev) => {
      const filtered = prev.filter((w) => w.id !== weekId);
      return filtered.map((w, i) => ({ ...w, weekNumber: i + 1 }));
    });
    await removeWeek(weekId, programme.id);
  }

  async function onAddCategory(weekId: string, category: SetCategory) {
    const scheme = await addSchemeCategory(weekId, category, programme.id);
    setWeeks((prev) =>
      prev.map((w) => (w.id !== weekId ? w : { ...w, schemes: [...w.schemes, scheme] })),
    );
  }

  async function onRemoveCategory(weekId: string, schemeId: string) {
    setWeeks((prev) =>
      prev.map((w) =>
        w.id !== weekId ? w : { ...w, schemes: w.schemes.filter((s) => s.id !== schemeId) },
      ),
    );
    await removeSchemeCategory(schemeId, programme.id);
  }

  async function onDelete() {
    if (!confirm(`Delete programme "${name}"?`)) return;
    await deleteProgramme(programme.id);
    router.push("/train");
  }

  return (
    <div className="pb-20">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        onBlur={onNameBlur}
        className="mb-2 w-full bg-transparent text-2xl font-bold outline-none"
        placeholder="Programme name"
      />
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        onBlur={onNameBlur}
        placeholder="Notes (optional)"
        className="mb-6 w-full resize-none rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-accent"
        rows={2}
      />

      <div className="space-y-4">
        {weeks.map((week) => {
          const usedCategories = new Set(week.schemes.map((s) => s.category));
          const availableCategories = ALL_CATEGORIES.filter((c) => !usedCategories.has(c));

          return (
            <div key={week.id} className="rounded-xl bg-surface p-4">
              <div className="mb-3 flex items-center gap-2">
                <span className="min-w-[4rem] text-sm font-semibold text-accent">
                  Week {week.weekNumber}
                </span>
                <input
                  value={week.label ?? ""}
                  onChange={(e) => patchWeekLabel(week.id, e.target.value)}
                  onBlur={(e) => onLabelBlur(week.id, e.target.value)}
                  placeholder="Label (optional)"
                  className="flex-1 rounded-md border border-border bg-surface-2 px-2 py-1 text-sm outline-none focus:border-accent"
                />
                {weeks.length > 1 && (
                  <button
                    onClick={() => onRemoveWeek(week.id)}
                    className="text-muted hover:text-danger"
                    aria-label="Remove week"
                  >
                    <IconTrash className="h-4 w-4" stroke={1.5} />
                  </button>
                )}
              </div>

              <div className="mb-3 space-y-2">
                <div className="grid grid-cols-[1fr_auto_auto] gap-2 text-xs text-muted">
                  <span>Category</span>
                  <span className="text-center">Sets</span>
                  <span className="text-center">Reps</span>
                </div>
                {week.schemes.map((s) => (
                  <div key={s.id} className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-2">
                    <span className="text-sm font-medium">{CATEGORY_LABEL[s.category]}</span>
                    <input
                      type="number"
                      min={1}
                      value={s.sets}
                      onChange={(e) => patchScheme(week.id, s.id, { sets: parseInt(e.target.value) || 1 })}
                      onBlur={(e) => onSchemeCommit(week.id, s.id, "sets", e.target.value)}
                      className="w-14 rounded-md border border-border bg-surface-2 px-2 py-1 text-center text-sm outline-none focus:border-accent"
                    />
                    <input
                      type="number"
                      min={1}
                      value={s.reps}
                      onChange={(e) => patchScheme(week.id, s.id, { reps: parseInt(e.target.value) || 1 })}
                      onBlur={(e) => onSchemeCommit(week.id, s.id, "reps", e.target.value)}
                      className="w-14 rounded-md border border-border bg-surface-2 px-2 py-1 text-center text-sm outline-none focus:border-accent"
                    />
                    <button
                      onClick={() => onRemoveCategory(week.id, s.id)}
                      className="text-muted hover:text-danger"
                      aria-label="Remove category"
                    >
                      <IconTrash className="h-3.5 w-3.5" stroke={1.5} />
                    </button>
                  </div>
                ))}
              </div>

              {availableCategories.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {availableCategories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => onAddCategory(week.id, cat)}
                      className="flex items-center gap-1 rounded-full bg-surface-2 px-2.5 py-1 text-xs text-muted hover:text-foreground"
                    >
                      <IconPlus className="h-3 w-3" stroke={1.5} />
                      {CATEGORY_LABEL[cat]}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button
        onClick={onAddWeek}
        className="mt-4 w-full rounded-xl border border-dashed border-border py-3 text-center text-sm font-semibold hover:border-accent"
      >
        + Add Week
      </button>

      <Button variant="danger" className="mt-4 w-full" onClick={onDelete}>
        Delete Programme
      </Button>
    </div>
  );
}
