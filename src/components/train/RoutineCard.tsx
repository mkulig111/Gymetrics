"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { deleteRoutine } from "@/lib/actions/routines";
import { startWorkoutFromRoutine } from "@/lib/actions/workouts";

export default function RoutineCard({
  routine,
}: {
  routine: {
    id: string;
    name: string;
    exercises: { id: string; exercise: { name: string }; sets: { id: string }[] }[];
  };
}) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm(`Delete routine "${routine.name}"?`)) return;
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
        <button onClick={handleDelete} className="text-xs text-danger">
          Delete
        </button>
      </div>
      <p className="mb-3 text-sm text-muted">
        {routine.exercises.length} exercises &middot; {totalSets} sets
      </p>
      <ul className="mb-3 space-y-1 text-sm text-muted">
        {routine.exercises.slice(0, 4).map((e) => (
          <li key={e.id}>{e.exercise.name}</li>
        ))}
        {routine.exercises.length > 4 && <li>+{routine.exercises.length - 4} more</li>}
      </ul>
      <div className="flex gap-2">
        <Link
          href={`/train/routines/${routine.id}/edit`}
          className="flex-1 rounded-lg bg-surface-2 px-4 py-2.5 text-center text-sm hover:bg-border"
        >
          Edit
        </Link>
        <form action={startWorkoutFromRoutine.bind(null, routine.id)} className="flex-1">
          <Button variant="primary" type="submit" className="w-full">
            Start
          </Button>
        </form>
      </div>
    </div>
  );
}
