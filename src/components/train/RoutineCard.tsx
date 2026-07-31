"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { IconArchive, IconArchiveOff, IconDumbbell, IconPencil, IconPlayerPlay, IconRotate, IconTrash } from "@tabler/icons-react";
import { archiveRoutine, deleteRoutine, resetDeload, unarchiveRoutine } from "@/lib/actions/routines";
import { startWorkoutFromRoutine } from "@/lib/actions/workouts";

export default function RoutineCard({
  routine,
  archived = false,
}: {
  routine: {
    id: string;
    name: string;
    deloadInterval: number;
    workoutsSinceDeload: number;
    exercises: { id: string; exercise: { name: string }; sets: { id: string }[] }[];
  };
  archived?: boolean;
}) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleArchive() {
    setMenuOpen(false);
    await archiveRoutine(routine.id);
    router.refresh();
  }

  async function handleUnarchive() {
    setMenuOpen(false);
    await unarchiveRoutine(routine.id);
    router.refresh();
  }

  async function handleDelete() {
    setMenuOpen(false);
    if (!confirm(`Delete routine "${routine.name}"? This cannot be undone.`)) return;
    await deleteRoutine(routine.id);
    router.refresh();
  }

  async function handleResetDeload() {
    setMenuOpen(false);
    await resetDeload(routine.id);
    router.refresh();
  }

  const totalSets = routine.exercises.reduce((sum, e) => sum + e.sets.length, 0);
  const progress = Math.min(routine.workoutsSinceDeload / routine.deloadInterval, 1);
  const isDeloadDue = routine.workoutsSinceDeload >= routine.deloadInterval;

  return (
    <div className="rounded-xl bg-surface p-4">
      <div className="mb-2 flex items-start justify-between">
        <Link href={`/train/routines/${routine.id}/edit`} className="text-lg font-bold hover:text-accent">
          {routine.name}
        </Link>
        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            onBlur={() => setTimeout(() => setMenuOpen(false), 150)}
            aria-label="Routine options"
            className="flex h-7 w-7 items-center justify-center rounded-md text-lg leading-none text-muted hover:text-foreground"
          >
            ···
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-8 z-20 min-w-[160px] overflow-hidden rounded-lg bg-surface-2 shadow-lg">
              {archived ? (
                <button
                  onClick={handleUnarchive}
                  className="flex w-full items-center gap-2 px-4 py-3 text-sm hover:bg-border"
                >
                  <IconArchiveOff className="h-4 w-4" stroke={1.5} /> Unarchive
                </button>
              ) : (
                <button
                  onClick={handleArchive}
                  className="flex w-full items-center gap-2 px-4 py-3 text-sm hover:bg-border"
                >
                  <IconArchive className="h-4 w-4" stroke={1.5} /> Archive
                </button>
              )}
              <button
                onClick={handleResetDeload}
                className="flex w-full items-center gap-2 border-t border-border px-4 py-3 text-sm hover:bg-border"
              >
                <IconRotate className="h-4 w-4" stroke={1.5} /> Reset
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
      <p className="mb-3 flex items-center gap-1 text-sm text-muted">
        <IconDumbbell className="h-3.5 w-3.5 shrink-0" stroke={1.5} />
        {routine.exercises.length} exercises &middot; {totalSets} sets
      </p>
      <ul className="mb-3 space-y-1 text-sm text-muted">
        {routine.exercises.slice(0, 4).map((e) => (
          <li key={e.id}>&bull; {e.exercise.name}</li>
        ))}
        {routine.exercises.length > 4 && <li>+{routine.exercises.length - 4} more</li>}
      </ul>

      <div className="mb-3">
        <div className="mb-1 flex items-center justify-between text-xs text-muted">
          <span>Deload</span>
          <span className={isDeloadDue ? "font-semibold text-red-500" : ""}>
            {isDeloadDue ? "Czas na deload!" : `${routine.workoutsSinceDeload} / ${routine.deloadInterval}`}
          </span>
        </div>
        <div className="relative h-3 w-full overflow-hidden rounded-full bg-surface-2">
          <div className="absolute inset-0" style={{ background: "linear-gradient(to right, #22c55e, #f97316, #ef4444)" }} />
          <div className="absolute right-0 top-0 h-full bg-surface-2 transition-all" style={{ width: `${(1 - progress) * 100}%` }} />
        </div>
      </div>

      {!archived && (
        <div className="flex gap-2">
          <Link
            href={`/train/routines/${routine.id}/edit`}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-surface-2 px-4 py-2.5 text-sm hover:bg-border"
          >
            <IconPencil className="h-3.5 w-3.5" stroke={1.5} /> Edit
          </Link>
          <form action={startWorkoutFromRoutine.bind(null, routine.id)} className="flex-1">
            <Button variant="primary" type="submit" className="flex w-full items-center justify-center gap-1.5">
              <IconPlayerPlay className="h-3.5 w-3.5" stroke={1.5} /> Start
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}
