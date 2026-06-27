import Link from "next/link";
import { getExercises } from "@/lib/actions/exercises";
import NewExerciseButton from "@/components/exercises/NewExerciseButton";

export default async function ExercisesPage() {
  const exercises = await getExercises();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Exercises</h1>
        <Link href="/exercises/body-parts" className="text-sm text-accent underline">
          Manage Body Parts
        </Link>
      </div>

      <NewExerciseButton />

      <div className="space-y-2">
        {exercises.map((ex) => (
          <Link
            key={ex.id}
            href={`/exercises/${ex.id}/edit`}
            className="flex items-center justify-between rounded-xl bg-surface p-4 hover:bg-surface-2"
          >
            <div>
              <p className="font-semibold">{ex.name}</p>
              <p className="text-xs text-muted">
                {ex.bodyParts.length > 0
                  ? ex.bodyParts.map((bp) => `${bp.bodyPart.name} ${bp.percentage}%`).join(", ")
                  : "No body parts assigned"}
              </p>
            </div>
            <span className="text-muted">✏️</span>
          </Link>
        ))}
        {exercises.length === 0 && (
          <p className="rounded-xl bg-surface p-6 text-center text-sm text-muted">No exercises yet.</p>
        )}
      </div>
    </div>
  );
}
