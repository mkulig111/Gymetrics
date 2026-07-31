"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ExerciseType } from "@/generated/prisma";
import Button from "@/components/ui/Button";
import ExercisePicker, { ExerciseOption } from "@/components/ExercisePicker";
import {
  addExerciseToRoutine,
  addSetToRoutineExercise,
  deleteRoutine,
  removeExerciseFromRoutine,
  removeRoutineSet,
  swapRoutineExercise,
  updateRoutineDetails,
  updateRoutineSet,
} from "@/lib/actions/routines";

type RoutineSetData = {
  id: string;
  setIndex: number;
  targetReps: number | null;
  targetWeightKg: number | null;
  targetSeconds: number | null;
};

export type RoutineExerciseData = {
  id: string;
  exerciseId: string;
  exercise: { id: string; name: string; type: ExerciseType };
  sets: RoutineSetData[];
};

export default function RoutineBuilderClient({
  routineId,
  initialName,
  initialNotes,
  initialLabel,
  initialDeloadInterval,
  initialExercises,
  exerciseLibrary,
}: {
  routineId: string;
  initialName: string;
  initialNotes: string;
  initialLabel: string;
  initialDeloadInterval: number;
  initialExercises: RoutineExerciseData[];
  exerciseLibrary: ExerciseOption[];
}) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [notes, setNotes] = useState(initialNotes);
  const [label, setLabel] = useState(initialLabel);
  const [deloadInterval, setDeloadInterval] = useState(initialDeloadInterval);
  const [exercises, setExercises] = useState(initialExercises);
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [swapTarget, setSwapTarget] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function patchSet(reId: string, setId: string, patch: Partial<RoutineSetData>) {
    setExercises((prev) =>
      prev.map((re) =>
        re.id !== reId
          ? re
          : { ...re, sets: re.sets.map((s) => (s.id === setId ? { ...s, ...patch } : s)) },
      ),
    );
  }

  function onNameBlur() {
    startTransition(() => {
      updateRoutineDetails(routineId, { name, notes, deloadInterval, label });
    });
  }

  function onFieldCommit(
    setId: string,
    field: "targetReps" | "targetWeightKg" | "targetSeconds",
    value: string,
  ) {
    const num = value.trim() === "" ? null : parseFloat(value);
    const re = exercises.find((r) => r.sets.some((s) => s.id === setId));
    if (re) patchSet(re.id, setId, { [field]: num } as Partial<RoutineSetData>);
    startTransition(() => {
      updateRoutineSet(setId, { [field]: num }, routineId);
    });
  }

  async function onAddSet(re: RoutineExerciseData) {
    const created = await addSetToRoutineExercise(re.id, routineId);
    setExercises((prev) =>
      prev.map((x) =>
        x.id !== re.id
          ? x
          : {
              ...x,
              sets: [
                ...x.sets,
                {
                  id: created.id,
                  setIndex: created.setIndex,
                  targetReps: created.targetReps,
                  targetWeightKg: created.targetWeightKg,
                  targetSeconds: created.targetSeconds,
                },
              ],
            },
      ),
    );
  }

  function onRemoveSet(re: RoutineExerciseData, setId: string) {
    setExercises((prev) =>
      prev.map((x) => (x.id !== re.id ? x : { ...x, sets: x.sets.filter((s) => s.id !== setId) })),
    );
    startTransition(() => {
      removeRoutineSet(setId, routineId);
    });
  }

  function onRemoveExercise(reId: string) {
    setExercises((prev) => prev.filter((x) => x.id !== reId));
    startTransition(() => {
      removeExerciseFromRoutine(reId, routineId);
    });
  }

  async function onPickAddExercise(exerciseId: string) {
    setShowAddExercise(false);
    const created = await addExerciseToRoutine(routineId, exerciseId);
    setExercises((prev) => [
      ...prev,
      {
        id: created.id,
        exerciseId: created.exerciseId,
        exercise: created.exercise,
        sets: created.sets,
      },
    ]);
  }

  async function onPickSwap(exerciseId: string) {
    if (!swapTarget) return;
    const reId = swapTarget;
    setSwapTarget(null);
    const exercise = exerciseLibrary.find((e) => e.id === exerciseId);
    if (exercise) {
      setExercises((prev) => prev.map((x) => (x.id !== reId ? x : { ...x, exerciseId, exercise })));
    }
    startTransition(() => {
      swapRoutineExercise(reId, exerciseId, routineId);
    });
  }

  async function onDeleteRoutine() {
    if (!confirm(`Delete routine "${name}"?`)) return;
    await deleteRoutine(routineId);
    router.push("/train");
  }

  return (
    <div className="pb-20">
      <div className="mb-2 flex items-center gap-3">
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value.toUpperCase().slice(0, 2))}
          onBlur={onNameBlur}
          maxLength={2}
          placeholder="A"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-center text-sm font-bold text-black outline-none placeholder:text-black/50"
        />
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={onNameBlur}
          className="flex-1 bg-transparent text-2xl font-bold outline-none"
          placeholder="Routine name"
        />
      </div>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        onBlur={onNameBlur}
        placeholder="Notes (e.g. 3 sets of 60 sec. 30-60 sec rest between sets)"
        className="mb-4 w-full resize-none rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-accent"
        rows={2}
      />

      <div className="mb-6 flex items-center gap-3">
        <label className="text-sm text-muted">Deload co ile treningów</label>
        <input
          type="number"
          min={1}
          max={52}
          value={deloadInterval}
          onChange={(e) => setDeloadInterval(Math.max(1, parseInt(e.target.value) || 1))}
          onBlur={onNameBlur}
          className="w-20 rounded-lg border border-border bg-surface-2 px-2 py-1 text-center text-sm outline-none focus:border-accent"
        />
      </div>

      <div className="space-y-6">
        {exercises.map((re, reIndex) => (
          <div key={re.id} className="rounded-xl bg-surface p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="font-bold text-accent">
                {reIndex + 1} {re.exercise.name}
              </span>
              <button onClick={() => setSwapTarget(re.id)} className="text-xs text-muted underline">
                Swap
              </button>
            </div>

            <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2 text-xs text-muted">
              <span>Set</span>
              <span>{re.exercise.type === ExerciseType.TIME ? "Target Seconds" : re.exercise.type === ExerciseType.BODYWEIGHT_REPS ? "Target Reps" : "Target kg x Reps"}</span>
              <span></span>
            </div>

            {re.sets.map((set) => (
              <div key={set.id} className="grid grid-cols-[auto_1fr_auto] items-center gap-2 border-t border-border py-2">
                <span className="text-muted">{set.setIndex + 1}</span>
                {re.exercise.type === ExerciseType.TIME ? (
                  <input
                    type="number"
                    defaultValue={set.targetSeconds ?? ""}
                    onBlur={(e) => onFieldCommit(set.id, "targetSeconds", e.target.value)}
                    placeholder="sec"
                    className="w-full rounded-md border border-border bg-surface-2 px-2 py-1 text-sm outline-none focus:border-accent"
                  />
                ) : (
                  <div className="flex gap-1">
                    {re.exercise.type === ExerciseType.WEIGHT_REPS && (
                      <input
                        type="number"
                        defaultValue={set.targetWeightKg ?? ""}
                        onBlur={(e) => onFieldCommit(set.id, "targetWeightKg", e.target.value)}
                        placeholder="kg"
                        className="w-full rounded-md border border-border bg-surface-2 px-2 py-1 text-sm outline-none focus:border-accent"
                      />
                    )}
                    <input
                      type="number"
                      defaultValue={set.targetReps ?? ""}
                      onBlur={(e) => onFieldCommit(set.id, "targetReps", e.target.value)}
                      placeholder="reps"
                      className="w-full rounded-md border border-border bg-surface-2 px-2 py-1 text-sm outline-none focus:border-accent"
                    />
                  </div>
                )}
                <button onClick={() => onRemoveSet(re, set.id)} className="text-xs text-danger">
                  &times;
                </button>
              </div>
            ))}

            <div className="mt-3 flex items-center justify-between">
              <button onClick={() => onAddSet(re)} className="text-sm font-semibold hover:text-accent">
                + Add Set
              </button>
              <button onClick={() => onRemoveExercise(re.id)} className="text-sm text-danger">
                Remove Exercise
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => setShowAddExercise(true)}
        className="mt-6 w-full rounded-xl border border-dashed border-border py-4 text-center font-semibold hover:border-accent"
      >
        + Add Exercise
      </button>

      <Button variant="danger" className="mt-4 w-full" onClick={onDeleteRoutine}>
        Delete Routine
      </Button>

      {showAddExercise && (
        <ExercisePicker
          title="Add Exercise"
          exercises={exerciseLibrary}
          onPick={onPickAddExercise}
          onClose={() => setShowAddExercise(false)}
        />
      )}

      {swapTarget && (
        <ExercisePicker
          title="Swap Exercise"
          exercises={exerciseLibrary}
          onPick={onPickSwap}
          onClose={() => setSwapTarget(null)}
        />
      )}
    </div>
  );
}
