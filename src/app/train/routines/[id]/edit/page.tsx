import { notFound } from "next/navigation";
import { getRoutine } from "@/lib/actions/routines";
import { getExercises } from "@/lib/actions/exercises";
import RoutineBuilderClient from "@/components/train/RoutineBuilderClient";

export default async function EditRoutinePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const routine = await getRoutine(id);
  if (!routine) notFound();

  const exerciseLibrary = await getExercises();

  return (
    <RoutineBuilderClient
      routineId={routine.id}
      initialName={routine.name}
      initialNotes={routine.notes ?? ""}
      initialExercises={routine.exercises}
      exerciseLibrary={exerciseLibrary}
    />
  );
}
