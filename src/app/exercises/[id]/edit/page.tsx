import { notFound } from "next/navigation";
import { getExercise, getBodyParts } from "@/lib/actions/exercises";
import ExerciseEditClient from "@/components/exercises/ExerciseEditClient";

export default async function EditExercisePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const exercise = await getExercise(id);
  if (!exercise) notFound();

  const bodyPartLibrary = await getBodyParts();

  return (
    <ExerciseEditClient
      exerciseId={exercise.id}
      initialName={exercise.name}
      initialType={exercise.type}
      initialBodyParts={exercise.bodyParts.map((bp) => ({
        bodyPartId: bp.bodyPartId,
        percentage: bp.percentage,
      }))}
      bodyPartLibrary={bodyPartLibrary}
    />
  );
}
