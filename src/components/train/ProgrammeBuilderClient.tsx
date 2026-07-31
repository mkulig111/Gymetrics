"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { IconTrash, IconPlus } from "@tabler/icons-react";
import { SetCategory, ProgrammeTemplate, MainLift, ProgressionCondition } from "@/generated/prisma";
import Button from "@/components/ui/Button";
import {
  addSchemeCategory,
  addWeek,
  deleteProgramme,
  removeSchemeCategory,
  removeWeek,
  setTemplate,
  setProgrammeDays,
  updateProgrammeDetails,
  updateProgrammeSettings,
  updateScheme,
  updateWeekLabel,
  updateWeekSchemeEntry,
} from "@/lib/actions/programmes";

// ── Types ─────────────────────────────────────────────────────────────────────

type SchemeEntry = { id: string; percent: number; reps: number; isAmrap: boolean; setOrder: number };
type WeekScheme = { id: string; weekNum: number; entries: SchemeEntry[] };
type CustomScheme = { id: string; category: SetCategory; sets: number; reps: number };
type CustomWeek = { id: string; weekNumber: number; label: string | null; schemes: CustomScheme[] };
type ProgrammeDay = { id: string; dayOfWeek: number; mainLift: MainLift; assistanceCategory: SetCategory };

export type ProgrammeData = {
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
  hasDeloadWeek: boolean;
  progressionUpper: number;
  progressionLower: number;
  progressionCondition: ProgressionCondition;
  amrapThreshold: number;
  weeks: CustomWeek[];
  days: ProgrammeDay[];
  weekSchemes: WeekScheme[];
};

// ── Constants ─────────────────────────────────────────────────────────────────

const TEMPLATE_LABEL: Record<ProgrammeTemplate, string> = {
  CUSTOM: "Custom",
  BBB: "BBB",
  TRIUMVIRATE: "Triumvirate",
  FSL: "FSL",
};

const TEMPLATE_DESC: Record<ProgrammeTemplate, string> = {
  CUSTOM: "Fixed sets × reps per category",
  BBB: "5/3/1 + 5×10 boring but big",
  TRIUMVIRATE: "5/3/1 + 3 assistance exercises",
  FSL: "5/3/1 + first set last",
};

const LIFT_LABEL: Record<MainLift, string> = {
  SQUAT: "Squat",
  BENCH: "Bench",
  DEADLIFT: "Deadlift",
  PRESS: "Press",
};

const CATEGORY_LABEL: Record<SetCategory, string> = {
  MAIN: "Main",
  DROP_OFF: "Drop-off",
  OTHER: "Other",
};

const ALL_CATEGORIES = [SetCategory.MAIN, SetCategory.DROP_OFF, SetCategory.OTHER];
const ALL_LIFTS: MainLift[] = [MainLift.SQUAT, MainLift.BENCH, MainLift.DEADLIFT, MainLift.PRESS];
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// ── Helpers ───────────────────────────────────────────────────────────────────

function computeWeight(tm1rm: number | null, tmPct: number, percent: number, rounding: number) {
  if (!tm1rm) return null;
  const tm = tm1rm * (tmPct / 100);
  return Math.round((tm * percent) / 100 / rounding) * rounding;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function ProgrammeBuilderClient({ programme }: { programme: ProgrammeData }) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  // Info
  const [name, setName] = useState(programme.name);
  const [notes, setNotes] = useState(programme.notes ?? "");

  // Template
  const [template, setTemplateState] = useState<ProgrammeTemplate>(programme.templateType);
  const [templatePending, setTemplatePending] = useState(false);

  // Settings
  const [tmSquat, setTmSquat] = useState(programme.tmSquat?.toString() ?? "");
  const [tmBench, setTmBench] = useState(programme.tmBench?.toString() ?? "");
  const [tmDeadlift, setTmDeadlift] = useState(programme.tmDeadlift?.toString() ?? "");
  const [tmPress, setTmPress] = useState(programme.tmPress?.toString() ?? "");
  const [tmPct, setTmPct] = useState(programme.tmPercentage);
  const [rounding, setRounding] = useState(programme.roundingIncrement);
  const [hasDeload, setHasDeload] = useState(programme.hasDeloadWeek);
  const [progUpper, setProgUpper] = useState(programme.progressionUpper);
  const [progLower, setProgLower] = useState(programme.progressionLower);

  // Schedule
  const [days, setDays] = useState<{ dayOfWeek: number; mainLift: MainLift; assistanceCategory: SetCategory }[]>(
    programme.days.map((d) => ({ dayOfWeek: d.dayOfWeek, mainLift: d.mainLift, assistanceCategory: d.assistanceCategory })),
  );

  // Week schemes (structured)
  const [weekSchemes, setWeekSchemes] = useState<WeekScheme[]>(programme.weekSchemes);

  // Custom weeks
  const [weeks, setWeeks] = useState<CustomWeek[]>(programme.weeks);

  // ── Handlers ─────────────────────────────────────────────────────────────────

  function onNameBlur() {
    startTransition(() => updateProgrammeDetails(programme.id, { name, notes }));
  }

  async function onTemplateChange(t: ProgrammeTemplate) {
    if (t === template) return;
    setTemplatePending(true);
    setTemplateState(t);
    await setTemplate(programme.id, t);
    setTemplatePending(false);
    router.refresh();
  }

  function saveTMs() {
    startTransition(() =>
      updateProgrammeSettings(programme.id, {
        tmSquat: tmSquat ? parseFloat(tmSquat) : null,
        tmBench: tmBench ? parseFloat(tmBench) : null,
        tmDeadlift: tmDeadlift ? parseFloat(tmDeadlift) : null,
        tmPress: tmPress ? parseFloat(tmPress) : null,
        tmPercentage: tmPct,
        roundingIncrement: rounding,
        hasDeloadWeek: hasDeload,
        progressionUpper: progUpper,
        progressionLower: progLower,
      }),
    );
  }

  function saveDays() {
    startTransition(() => setProgrammeDays(programme.id, days));
  }

  function toggleDay(dayOfWeek: number) {
    setDays((prev) => {
      const exists = prev.find((d) => d.dayOfWeek === dayOfWeek);
      if (exists) return prev.filter((d) => d.dayOfWeek !== dayOfWeek);
      return [...prev, { dayOfWeek, mainLift: MainLift.SQUAT, assistanceCategory: SetCategory.MAIN }].sort(
        (a, b) => a.dayOfWeek - b.dayOfWeek,
      );
    });
  }

  function updateDayLift(dayOfWeek: number, mainLift: MainLift) {
    setDays((prev) => prev.map((d) => (d.dayOfWeek === dayOfWeek ? { ...d, mainLift } : d)));
  }

  function updateDayAssistance(dayOfWeek: number, assistanceCategory: SetCategory) {
    setDays((prev) => prev.map((d) => (d.dayOfWeek === dayOfWeek ? { ...d, assistanceCategory } : d)));
  }

  function patchEntry(weekNum: number, entryId: string, patch: Partial<SchemeEntry>) {
    setWeekSchemes((prev) =>
      prev.map((ws) =>
        ws.weekNum !== weekNum
          ? ws
          : { ...ws, entries: ws.entries.map((e) => (e.id === entryId ? { ...e, ...patch } : e)) },
      ),
    );
  }

  function onEntryBlur(entryId: string, field: "percent" | "reps", value: string, programmeId: string) {
    const num = parseFloat(value) || 0;
    startTransition(() => updateWeekSchemeEntry(entryId, { [field]: num }, programmeId));
  }

  function onAmrapToggle(entryId: string, weekNum: number, isAmrap: boolean) {
    patchEntry(weekNum, entryId, { isAmrap });
    startTransition(() => updateWeekSchemeEntry(entryId, { isAmrap }, programme.id));
  }

  // Custom week handlers
  function patchScheme(weekId: string, schemeId: string, patch: Partial<CustomScheme>) {
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
    setWeeks((prev) => [...prev, created as CustomWeek]);
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
      prev.map((w) => (w.id !== weekId ? w : { ...w, schemes: [...w.schemes, scheme as CustomScheme] })),
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

  const isStructured = template !== ProgrammeTemplate.CUSTOM;
  const tms: Record<MainLift, string> = {
    SQUAT: tmSquat,
    BENCH: tmBench,
    DEADLIFT: tmDeadlift,
    PRESS: tmPress,
  };

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 pb-20">
      {/* Name + Notes */}
      <div>
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
          className="w-full resize-none rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-accent"
          rows={2}
        />
      </div>

      {/* Template selector */}
      <div>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Template</h3>
        <div className="grid grid-cols-2 gap-2">
          {(Object.keys(TEMPLATE_LABEL) as ProgrammeTemplate[]).map((t) => (
            <button
              key={t}
              onClick={() => onTemplateChange(t)}
              disabled={templatePending}
              className={`rounded-xl p-3 text-left transition-colors ${
                template === t
                  ? "bg-accent text-black"
                  : "bg-surface-2 text-foreground hover:bg-border"
              }`}
            >
              <div className="text-sm font-semibold">{TEMPLATE_LABEL[t]}</div>
              <div className={`text-xs ${template === t ? "text-black/60" : "text-muted"}`}>
                {TEMPLATE_DESC[t]}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Structured: Training Maxes */}
      {isStructured && (
        <div className="rounded-xl bg-surface p-4">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">Training Maxes (1RM kg)</h3>
          <div className="mb-3 grid grid-cols-2 gap-2">
            {(["SQUAT", "BENCH", "DEADLIFT", "PRESS"] as const).map((lift) => (
              <div key={lift}>
                <label className="mb-1 block text-xs text-muted">{LIFT_LABEL[lift]}</label>
                <input
                  type="number"
                  min={0}
                  step={2.5}
                  value={tms[lift]}
                  onChange={(e) => {
                    if (lift === "SQUAT") setTmSquat(e.target.value);
                    else if (lift === "BENCH") setTmBench(e.target.value);
                    else if (lift === "DEADLIFT") setTmDeadlift(e.target.value);
                    else setTmPress(e.target.value);
                  }}
                  onBlur={saveTMs}
                  placeholder="kg"
                  className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-accent"
                />
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs text-muted">TM %</label>
              <input
                type="number"
                min={50}
                max={100}
                value={tmPct}
                onChange={(e) => setTmPct(parseFloat(e.target.value) || 90)}
                onBlur={saveTMs}
                className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted">Rounding (kg)</label>
              <div className="flex gap-1">
                {[1, 2.5, 5].map((r) => (
                  <button
                    key={r}
                    onClick={() => { setRounding(r); saveTMs(); }}
                    className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
                      rounding === r ? "bg-accent text-black" : "bg-surface-2 text-foreground hover:bg-border"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Structured: Cycle + Progression */}
      {isStructured && (
        <div className="rounded-xl bg-surface p-4">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">Cycle & Progression</h3>
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm">Deload week</span>
            <button
              onClick={() => { setHasDeload((v) => !v); saveTMs(); }}
              className={`h-6 w-11 rounded-full transition-colors ${hasDeload ? "bg-accent" : "bg-surface-2"}`}
            >
              <span
                className={`block h-5 w-5 translate-x-0.5 rounded-full bg-white transition-transform ${hasDeload ? "translate-x-[1.375rem]" : ""}`}
              />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs text-muted">Upper +kg/cycle</label>
              <input
                type="number"
                min={0}
                step={2.5}
                value={progUpper}
                onChange={(e) => setProgUpper(parseFloat(e.target.value) || 0)}
                onBlur={saveTMs}
                className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted">Lower +kg/cycle</label>
              <input
                type="number"
                min={0}
                step={2.5}
                value={progLower}
                onChange={(e) => setProgLower(parseFloat(e.target.value) || 0)}
                onBlur={saveTMs}
                className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-accent"
              />
            </div>
          </div>
        </div>
      )}

      {/* Structured: Weekly schedule */}
      {isStructured && (
        <div className="rounded-xl bg-surface p-4">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">Weekly Schedule</h3>
          <div className="mb-3 flex gap-1.5">
            {DAYS.map((label, i) => {
              const active = days.some((d) => d.dayOfWeek === i);
              return (
                <button
                  key={i}
                  onClick={() => { toggleDay(i); setTimeout(saveDays, 0); }}
                  className={`flex-1 rounded-lg py-1.5 text-xs font-medium transition-colors ${
                    active ? "bg-accent text-black" : "bg-surface-2 text-muted hover:bg-border"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
          {days.map((d) => (
            <div key={d.dayOfWeek} className="mb-2 flex items-center gap-2">
              <span className="w-8 text-xs font-semibold text-accent">{DAYS[d.dayOfWeek]}</span>
              <select
                value={d.mainLift}
                onChange={(e) => { updateDayLift(d.dayOfWeek, e.target.value as MainLift); saveDays(); }}
                className="flex-1 rounded-lg border border-border bg-surface-2 px-2 py-1 text-sm outline-none focus:border-accent"
              >
                {ALL_LIFTS.map((l) => <option key={l} value={l}>{LIFT_LABEL[l]}</option>)}
              </select>
              <select
                value={d.assistanceCategory}
                onChange={(e) => { updateDayAssistance(d.dayOfWeek, e.target.value as SetCategory); saveDays(); }}
                className="flex-1 rounded-lg border border-border bg-surface-2 px-2 py-1 text-sm outline-none focus:border-accent"
              >
                {ALL_CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_LABEL[c]}</option>)}
              </select>
            </div>
          ))}
        </div>
      )}

      {/* Structured: Week schemes table */}
      {isStructured && weekSchemes.length > 0 && (
        <div className="rounded-xl bg-surface p-4">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">Week Schemes</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="pb-2 text-left text-xs text-muted">Set</th>
                  {weekSchemes.map((ws) => (
                    <th key={ws.id} className="pb-2 text-center text-xs text-muted">
                      Wk {ws.weekNum}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: Math.max(...weekSchemes.map((ws) => ws.entries.length)) }).map((_, row) => (
                  <tr key={row}>
                    <td className="py-1 pr-2 text-xs text-muted">{row + 1}</td>
                    {weekSchemes.map((ws) => {
                      const entry = ws.entries[row];
                      if (!entry) return <td key={ws.id} />;
                      return (
                        <td key={ws.id} className="py-1 text-center">
                          <div className="flex items-center justify-center gap-0.5">
                            <input
                              type="number"
                              min={1}
                              max={100}
                              value={entry.percent}
                              onChange={(e) => patchEntry(ws.weekNum, entry.id, { percent: parseFloat(e.target.value) || 0 })}
                              onBlur={(e) => onEntryBlur(entry.id, "percent", e.target.value, programme.id)}
                              className="w-10 rounded border border-border bg-surface-2 px-1 py-0.5 text-center text-xs outline-none focus:border-accent"
                            />
                            <span className="text-xs text-muted">%×</span>
                            <input
                              type="number"
                              min={1}
                              value={entry.reps}
                              onChange={(e) => patchEntry(ws.weekNum, entry.id, { reps: parseInt(e.target.value) || 1 })}
                              onBlur={(e) => onEntryBlur(entry.id, "reps", e.target.value, programme.id)}
                              className="w-8 rounded border border-border bg-surface-2 px-1 py-0.5 text-center text-xs outline-none focus:border-accent"
                            />
                            <button
                              onClick={() => onAmrapToggle(entry.id, ws.weekNum, !entry.isAmrap)}
                              className={`rounded px-1 py-0.5 text-xs font-bold ${entry.isAmrap ? "text-accent" : "text-muted"}`}
                              title="AMRAP"
                            >
                              +
                            </button>
                          </div>
                          {/* Computed weights preview */}
                          <div className="mt-0.5 space-y-0.5">
                            {ALL_LIFTS.map((lift) => {
                              const tm1rm = { SQUAT: programme.tmSquat, BENCH: programme.tmBench, DEADLIFT: programme.tmDeadlift, PRESS: programme.tmPress }[lift];
                              const w = computeWeight(tm1rm, tmPct, entry.percent, rounding);
                              if (!w) return null;
                              return (
                                <div key={lift} className="text-[10px] text-muted">
                                  {LIFT_LABEL[lift][0]}: {w}kg
                                </div>
                              );
                            })}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Custom: per-week builder */}
      {!isStructured && (
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

          <button
            onClick={onAddWeek}
            className="w-full rounded-xl border border-dashed border-border py-3 text-center text-sm font-semibold hover:border-accent"
          >
            + Add Week
          </button>
        </div>
      )}

      <Button variant="danger" className="w-full" onClick={onDelete}>
        Delete Programme
      </Button>
    </div>
  );
}
