import Link from "next/link";
import { getExercises } from "@/lib/actions/exercises";
import NewExerciseButton from "@/components/exercises/NewExerciseButton";
import ExercisesClient from "@/components/exercises/ExercisesClient";

export default async function ExercisesPage() {
  const exercises = await getExercises();

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Exercises</h1>

      <div className="flex gap-2">
        <div className="flex-1">
          <NewExerciseButton />
        </div>
        <Link
          href="/exercises/body-parts"
          className="flex flex-1 items-center justify-center rounded-full bg-surface-2 px-4 py-2.5 text-sm text-foreground hover:bg-border"
        >
          + Body parts
        </Link>
      </div>

      <ExercisesClient exercises={exercises} />
    </div>
  );
}
