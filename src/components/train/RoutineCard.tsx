"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { archiveRoutine, deleteRoutine, unarchiveRoutine } from "@/lib/actions/routines";
import { startWorkoutFromRoutine } from "@/lib/actions/workouts";

export default function RoutineCard({
  routine,
  archived = false,
}: {
  routine: {
    id: string;
    name: string;
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

  const totalSets = routine.exercises.reduce((sum, e) => sum + e.sets.length, 0);

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
            <div className="absolute right-0 top-8 z-20 min-w-[140px] overflow-hidden rounded-lg bg-surface-2 shadow-lg">
              {archived ? (
                <button
                  onClick={handleUnarchive}
                  className="flex w-full items-center gap-2 px-4 py-3 text-sm hover:bg-border"
                >
                  <span>📤</span> Unarchive
                </button>
              ) : (
                <button
                  onClick={handleArchive}
                  className="flex w-full items-center gap-2 px-4 py-3 text-sm hover:bg-border"
                >
                  <span>📦</span> Archive
                </button>
              )}
              <button
                onClick={handleDelete}
                className="flex w-full items-center gap-2 border-t border-border px-4 py-3 text-sm text-danger hover:bg-border"
              >
                <span>🗑️</span> Delete
              </button>
            </div>
          )}
        </div>
      </div>
      <p className="mb-3 text-sm text-muted">
        🏋️ {routine.exercises.length} exercises &middot; {totalSets} sets
      </p>
      <ul className="mb-3 space-y-1 text-sm text-muted">
        {routine.exercises.slice(0, 4).map((e) => (
          <li key={e.id}>&bull; {e.exercise.name}</li>
        ))}
        {routine.exercises.length > 4 && <li>+{routine.exercises.length - 4} more</li>}
      </ul>
      {!archived && (
        <div className="flex gap-2">
          <Link
            href={`/train/routines/${routine.id}/edit`}
            className="flex-1 rounded-full bg-surface-2 px-4 py-2.5 text-center text-sm hover:bg-border"
          >
            ✏️ Edit
          </Link>
          <form action={startWorkoutFromRoutine.bind(null, routine.id)} className="flex-1">
            <Button variant="primary" type="submit" className="w-full">
              ▶ Start
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}
