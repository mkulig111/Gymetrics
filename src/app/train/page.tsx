import { IconBolt } from "@tabler/icons-react";
import { getArchivedRoutines, getRoutines } from "@/lib/actions/routines";
import { startEmptyWorkout } from "@/lib/actions/workouts";
import RoutineCard from "@/components/train/RoutineCard";
import NewRoutineButton from "@/components/train/NewRoutineButton";
import Button from "@/components/ui/Button";

export default async function TrainPage() {
  const [routines, archivedRoutines] = await Promise.all([getRoutines(), getArchivedRoutines()]);

  return (
    <div className="space-y-6">
      <form action={startEmptyWorkout}>
        <Button variant="primary" type="submit" className="flex w-full items-center justify-center gap-2 py-4 text-base">
          <IconBolt className="h-4 w-4" stroke={1.5} /> Start Empty Workout
        </Button>
      </form>

      <NewRoutineButton />

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
          My Routines
        </h2>
        {routines.length === 0 ? (
          <p className="rounded-xl bg-surface p-6 text-center text-sm text-muted">
            No routines yet. Create one to get started.
          </p>
        ) : (
          <div className="space-y-4">
            {routines.map((r) => (
              <RoutineCard key={r.id} routine={r} />
            ))}
          </div>
        )}
      </div>

      {archivedRoutines.length > 0 && (
        <details className="group">
          <summary className="cursor-pointer list-none">
            <h2 className="inline text-sm font-semibold uppercase tracking-wide text-muted">
              Archived ({archivedRoutines.length})
            </h2>
          </summary>
          <div className="mt-3 space-y-4">
            {archivedRoutines.map((r) => (
              <RoutineCard key={r.id} routine={r} archived />
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
