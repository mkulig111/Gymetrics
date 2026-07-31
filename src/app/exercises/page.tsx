import Link from "next/link";
import { IconAdjustmentsHorizontal } from "@tabler/icons-react";
import { getExercises } from "@/lib/actions/exercises";
import NewExerciseButton from "@/components/exercises/NewExerciseButton";
import ExercisesClient from "@/components/exercises/ExercisesClient";

export default async function ExercisesPage() {
  const exercises = await getExercises();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Exercises</h1>
        <Link
          href="/exercises/body-parts"
          aria-label="Manage body parts"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:text-foreground"
        >
          <IconAdjustmentsHorizontal className="h-5 w-5" stroke={1.5} />
        </Link>
      </div>

      <NewExerciseButton />

      <ExercisesClient exercises={exercises} />
    </div>
  );
}
