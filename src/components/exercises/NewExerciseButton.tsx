"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Button from "@/components/ui/Button";
import { createCustomExercise } from "@/lib/actions/exercises";
import { ExerciseType } from "@/generated/prisma";

export default function NewExerciseButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    const exercise = await createCustomExercise("New Exercise", ExerciseType.WEIGHT_REPS);
    router.push(`/exercises/${exercise.id}/edit`);
  }

  return (
    <Button variant="secondary" className="w-full" disabled={loading} onClick={handleClick}>
      ➕ New Exercise
    </Button>
  );
}
