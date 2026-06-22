"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ExerciseType } from "@/generated/prisma";
import Button from "@/components/ui/Button";
import ExercisePicker, { ExerciseOption } from "@/components/ExercisePicker";
import {
  addExerciseToWorkout,
  addSetToWorkoutExercise,
  removeWorkoutExercise,
  removeWorkoutSet,
  swapWorkoutExercise,
  toggleSetComplete,
  updateWorkoutSet,
} from "@/lib/actions/workouts";
import { deleteWorkoutSession } from "@/lib/actions/history";

type SetData = {
  id: string;
  setIndex: number;
  weightKg: number | null;
  reps: number | null;
  seconds: number | null;
  completed: boolean;
  isPr: boolean;
};

export type HistoryWorkoutExerciseData = {
  id: string;
  exerciseId: string;
  exercise: { id: string; name: string; muscleGroup: string; type: ExerciseType };
  sets: SetData[];
};

export default function HistoryEditClient({
  sessionId,
  routineName,
  startedAt,
  initialExercises,
  exerciseLibrary,
}: {
  sessionId: string;
  routineName: string;
  startedAt: number;
  initialExercises: HistoryWorkoutExerciseData[];
  exerciseLibrary: ExerciseOption[];
}) {
  const [exercises, setExercises] = useState(initialExercises);
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [swapTarget, setSwapTarget] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function patchSet(weId: string, setId: string, patch: Partial<SetData>) {
    setExercises((prev) =>
      prev.map((we) =>
        we.id !== weId
          ? we
          : { ...we, sets: we.sets.map((s) => (s.id === setId ? { ...s, ...patch } : s)) },
      ),
    );
  }

  function onToggleComplete(weId: string, set: SetData) {
    const next = !set.completed;
    patchSet(weId, set.id, { completed: next });
    startTransition(() => {
      toggleSetComplete(set.id, next, sessionId);
    });
  }

  function onFieldCommit(weId: string, setId: string, field: "weightKg" | "reps" | "seconds", value: string) {
    const num = value.trim() === "" ? null : parseFloat(value);
    patchSet(weId, setId, { [field]: num } as Partial<SetData>);
    startTransition(() => {
      updateWorkoutSet(setId, { [field]: num }, sessionId);
    });
  }

  async function onAddSet(we: HistoryWorkoutExerciseData) {
    const created = await addSetToWorkoutExercise(we.id, sessionId);
    setExercises((prev) =>
      prev.map((x) =>
        x.id !== we.id
          ? x
          : {
              ...x,
              sets: [
                ...x.sets,
                {
                  id: created.id,
                  setIndex: created.setIndex,
                  weightKg: created.weightKg,
                  reps: created.reps,
                  seconds: created.seconds,
                  completed: created.completed,
                  isPr: created.isPr,
                },
              ],
            },
      ),
    );
  }

  function onRemoveSet(we: HistoryWorkoutExerciseData, setId: string) {
    setExercises((prev) =>
      prev.map((x) => (x.id !== we.id ? x : { ...x, sets: x.sets.filter((s) => s.id !== setId) })),
    );
    startTransition(() => {
      removeWorkoutSet(setId, sessionId);
    });
  }

  function onRemoveExercise(weId: string) {
    setExercises((prev) => prev.filter((x) => x.id !== weId));
    startTransition(() => {
      removeWorkoutExercise(weId, sessionId);
    });
  }

  async function onPickAddExercise(exerciseId: string) {
    setShowAddExercise(false);
    const created = await addExerciseToWorkout(sessionId, exerciseId);
    setExercises((prev) => [
      ...prev,
      {
        id: created.id,
        exerciseId: created.exerciseId,
        exercise: created.exercise,
        sets: created.sets.map((s) => ({
          id: s.id,
          setIndex: s.setIndex,
          weightKg: s.weightKg,
          reps: s.reps,
          seconds: s.seconds,
          completed: s.completed,
          isPr: s.isPr,
        })),
      },
    ]);
  }

  async function onPickSwap(exerciseId: string) {
    if (!swapTarget) return;
    const weId = swapTarget;
    setSwapTarget(null);
    const newExercise = exerciseLibrary.find((e) => e.id === exerciseId);
    if (newExercise) {
      setExercises((prev) =>
        prev.map((x) => (x.id !== weId ? x : { ...x, exerciseId, exercise: newExercise })),
      );
    }
    startTransition(() => {
      swapWorkoutExercise(weId, exerciseId, sessionId);
    });
  }

  async function onDelete() {
    if (!confirm("Delete this workout? This cannot be undone.")) return;
    await deleteWorkoutSession(sessionId);
  }

  return (
    <div className="pb-32">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">{routineName}</h1>
          <p className="text-sm text-muted">
            {new Date(startedAt).toLocaleDateString(undefined, {
              weekday: "long",
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>
        <Link href={`/history/${sessionId}`}>
          <Button variant="primary">Done</Button>
        </Link>
      </div>

      <div className="space-y-6">
        {exercises.map((we, weIndex) => (
          <div key={we.id} className="rounded-xl bg-surface p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="font-bold text-accent">
                {weIndex + 1} {we.exercise.name}
              </span>
              <button onClick={() => setSwapTarget(we.id)} className="text-xs text-muted underline">
                Swap
              </button>
            </div>

            <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2 text-xs text-muted">
              <span>Set</span>
              <span>{we.exercise.type === ExerciseType.TIME ? "Seconds" : we.exercise.type === ExerciseType.BODYWEIGHT_REPS ? "Reps" : "kg x Reps"}</span>
              <span>✓</span>
            </div>

            {we.sets.map((set) => (
              <div
                key={set.id}
                className="grid grid-cols-[auto_1fr_auto] items-center gap-2 border-t border-border py-2"
              >
                <span className="text-muted">{set.setIndex + 1}</span>
                {we.exercise.type === ExerciseType.TIME ? (
                  <input
                    type="number"
                    defaultValue={set.seconds ?? ""}
                    onBlur={(e) => onFieldCommit(we.id, set.id, "seconds", e.target.value)}
                    className="w-full rounded-md border border-border bg-surface-2 px-2 py-1 text-center text-sm outline-none focus:border-accent"
                  />
                ) : (
                  <div className="flex gap-1">
                    {we.exercise.type === ExerciseType.WEIGHT_REPS && (
                      <input
                        type="number"
                        defaultValue={set.weightKg ?? ""}
                        onBlur={(e) => onFieldCommit(we.id, set.id, "weightKg", e.target.value)}
                        placeholder="kg"
                        className="w-full rounded-md border border-border bg-surface-2 px-2 py-1 text-center text-sm outline-none focus:border-accent"
                      />
                    )}
                    <input
                      type="number"
                      defaultValue={set.reps ?? ""}
                      onBlur={(e) => onFieldCommit(we.id, set.id, "reps", e.target.value)}
                      placeholder="reps"
                      className="w-full rounded-md border border-border bg-surface-2 px-2 py-1 text-center text-sm outline-none focus:border-accent"
                    />
                  </div>
                )}
                <button
                  onClick={() => onToggleComplete(we.id, set)}
                  aria-label={set.completed ? "Mark set incomplete" : "Mark set complete"}
                  className={`flex h-7 w-7 items-center justify-center rounded-full ${
                    set.completed ? "bg-accent text-black" : "bg-surface-2 text-muted"
                  }`}
                >
                  {set.isPr ? "🏆" : "✓"}
                </button>
              </div>
            ))}

            <div className="mt-3 flex items-center justify-between">
              <button onClick={() => onAddSet(we)} className="text-sm font-semibold text-foreground hover:text-accent">
                + Add Set
              </button>
              {we.sets.length > 0 && (
                <button
                  onClick={() => onRemoveSet(we, we.sets[we.sets.length - 1].id)}
                  className="text-sm text-muted hover:text-danger"
                >
                  Remove Set
                </button>
              )}
              <button onClick={() => onRemoveExercise(we.id)} className="text-sm text-danger">
                Remove
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

      <Button variant="danger" className="mt-4 w-full" onClick={onDelete}>
        Delete Workout
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
