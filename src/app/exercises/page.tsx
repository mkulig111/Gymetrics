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
          className="flex h-[42px] shrink-0 items-center justify-center rounded-xl bg-surface-2 px-3 text-sm text-muted hover:text-foreground"
        >
          + Body parts
        </Link>
      </div>

      <ExercisesClient exercises={exercises} />
    </div>
  );
}
