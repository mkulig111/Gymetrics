"use client";

import { useMemo, useState, useTransition } from "react";
import { ExerciseType } from "@/generated/prisma";
import Button from "@/components/ui/Button";
import ExercisePicker, { ExerciseOption } from "@/components/ExercisePicker";
import ElapsedTimer from "@/components/workout/ElapsedTimer";
import { RestTimerBar, RestTimerPickerModal } from "@/components/workout/RestTimer";
import MuscleVolumeModal from "@/components/workout/MuscleVolumeModal";
import PlateCalcModal from "@/components/workout/PlateCalcModal";
import {
  addExerciseToWorkout,
  addSetToWorkoutExercise,
  discardWorkout,
  finishWorkout,
  removeWorkoutExercise,
  removeWorkoutSet,
  swapWorkoutExercise,
  toggleSetComplete,
  updateWorkoutSet,
} from "@/lib/actions/workouts";
type SetData = {
  id: string;
  setIndex: number;
  weightKg: number | null;
  reps: number | null;
  seconds: number | null;
  completed: boolean;
  isPr: boolean;
};

type PrevSet = { setIndex: number; weightKg: number | null; reps: number | null; seconds: number | null };

export type WorkoutExerciseData = {
  id: string;
  exerciseId: string;
  exercise: {
    id: string;
    name: string;
    type: ExerciseType;
    bodyParts: { percentage: number; bodyPart: { id: string; name: string } }[];
  };
  sets: SetData[];
  previousSets: PrevSet[];
};

export default function WorkoutSessionClient({
  sessionId,
  routineName,
  startedAt,
  initialExercises,
  exerciseLibrary,
}: {
  sessionId: string;
  routineName: string;
  startedAt: number;
  initialExercises: WorkoutExerciseData[];
  exerciseLibrary: ExerciseOption[];
}) {
  const [exercises, setExercises] = useState(initialExercises);
  const [restEndAt, setRestEndAt] = useState<number | null>(null);
  const [showRestPicker, setShowRestPicker] = useState(false);
  const [showVolume, setShowVolume] = useState(false);
  const [showCalc, setShowCalc] = useState(false);
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [swapTarget, setSwapTarget] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const volume = useMemo(() => {
    const map = new Map<string, number>();
    for (const we of exercises) {
      const load = we.sets
        .filter((s) => s.completed)
        .reduce((sum, s) => {
          if (we.exercise.type === ExerciseType.WEIGHT_REPS && s.weightKg && s.reps) return sum + s.weightKg * s.reps;
          if (we.exercise.type === ExerciseType.BODYWEIGHT_REPS && s.reps) return sum + s.reps;
          if (we.exercise.type === ExerciseType.TIME && s.seconds) return sum + s.seconds;
          return sum;
        }, 0);
      if (load === 0) continue;
      for (const bp of we.exercise.bodyParts) {
        const name = bp.bodyPart.name;
        map.set(name, (map.get(name) ?? 0) + load * (bp.percentage / 100));
      }
    }
    return [...map.entries()].map(([muscle, volume]) => ({ muscle, volume })).sort((a, b) => b.volume - a.volume);
  }, [exercises]);

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
    if (next) setRestEndAt(null);
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

  async function onAddSet(we: WorkoutExerciseData) {
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
                  completed: false,
                  isPr: false,
                },
              ],
            },
      ),
    );
  }

  function onRemoveSet(we: WorkoutExerciseData, setId: string) {
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
        previousSets: [],
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
        prev.map((x) => (x.id !== weId ? x : { ...x, exerciseId, exercise: newExercise, previousSets: [] })),
      );
    }
    startTransition(() => {
      swapWorkoutExercise(weId, exerciseId, sessionId);
    });
  }

  async function onFinish() {
    await finishWorkout(sessionId);
  }

  async function onDiscard() {
    if (!confirm("Discard this workout? This cannot be undone.")) return;
    await discardWorkout(sessionId);
  }

  return (
    <div className="pb-32">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex gap-4">
          <button onClick={() => setShowRestPicker(true)} className="flex flex-col items-center gap-1 text-muted">
            <span className="text-xl">⏱</span>
            <span className="text-xs">Rest</span>
          </button>
          <button onClick={() => setShowCalc(true)} className="flex flex-col items-center gap-1 text-muted">
            <span className="text-xl">🧮</span>
            <span className="text-xs">Calc</span>
          </button>
          <button onClick={() => setShowVolume(true)} className="flex flex-col items-center gap-1 text-muted">
            <span className="text-xl">💪</span>
            <span className="text-xs">Vol</span>
          </button>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-lg bg-surface-2 px-3 py-2 font-mono text-sm">
            <ElapsedTimer startedAt={startedAt} />
          </span>
          <Button variant="primary" onClick={onFinish}>
            Finish
          </Button>
        </div>
      </div>

      <h1 className="mb-4 text-xl font-bold">{routineName}</h1>

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

            <div className="grid grid-cols-[auto_1fr_1fr_1fr_auto] items-center gap-2 text-xs text-muted">
              <span>Set</span>
              <span>Previous</span>
              <span>Target</span>
              <span>{we.exercise.type === ExerciseType.TIME ? "Seconds" : we.exercise.type === ExerciseType.BODYWEIGHT_REPS ? "Reps" : "kg x Reps"}</span>
              <span>✓</span>
            </div>

            {we.sets.map((set) => {
              const prev = we.previousSets.find((p) => p.setIndex === set.setIndex);
              return (
                <div
                  key={set.id}
                  className="grid grid-cols-[auto_1fr_1fr_1fr_auto] items-center gap-2 border-t border-border py-2"
                >
                  <span className="text-muted">{set.setIndex + 1}</span>
                  <span className="text-xs text-muted">
                    {prev
                      ? we.exercise.type === ExerciseType.TIME
                        ? `${prev.seconds ?? "-"} sec`
                        : we.exercise.type === ExerciseType.BODYWEIGHT_REPS
                          ? `${prev.reps ?? "-"} reps`
                          : `${prev.weightKg ?? "-"}kg x ${prev.reps ?? "-"}`
                      : "-"}
                  </span>
                  <span className="text-xs text-muted">-</span>
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
                  <div className="flex items-center gap-1">
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
                </div>
              );
            })}

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

      <Button variant="danger" className="mt-4 w-full" onClick={onDiscard}>
        Discard Workout
      </Button>

      {restEndAt && (
        <RestTimerBar
          endAt={restEndAt}
          onAdjust={(d) => setRestEndAt((v) => (v ? v + d * 1000 : v))}
          onClear={() => setRestEndAt(null)}
        />
      )}

      {showRestPicker && (
        <RestTimerPickerModal
          onPick={(s) => {
            setRestEndAt(Date.now() + s * 1000);
            setShowRestPicker(false);
          }}
          onClose={() => setShowRestPicker(false)}
        />
      )}

      {showVolume && <MuscleVolumeModal volume={volume} onClose={() => setShowVolume(false)} />}
      {showCalc && <PlateCalcModal onClose={() => setShowCalc(false)} />}

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
