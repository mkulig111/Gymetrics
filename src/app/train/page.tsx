import { getRoutines } from "@/lib/actions/routines";
import { startEmptyWorkout } from "@/lib/actions/workouts";
import RoutineCard from "@/components/train/RoutineCard";
import NewRoutineButton from "@/components/train/NewRoutineButton";
import Button from "@/components/ui/Button";

export default async function TrainPage() {
  const routines = await getRoutines();

  return (
    <div className="space-y-6">
      <form action={startEmptyWorkout}>
        <Button variant="primary" type="submit" className="w-full py-4 text-base">
          Start Empty Workout
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
    </div>
  );
}
