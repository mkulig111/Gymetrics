import Link from "next/link";
import { IconAdjustmentsHorizontal } from "@tabler/icons-react";
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
          aria-label="Manage body parts"
          className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-xl bg-surface-2 text-muted hover:text-foreground"
        >
          <IconAdjustmentsHorizontal className="h-5 w-5" stroke={1.5} />
        </Link>
      </div>

      <ExercisesClient exercises={exercises} />
    </div>
  );
}
