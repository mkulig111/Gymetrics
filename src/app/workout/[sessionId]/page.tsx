import { notFound, redirect } from "next/navigation";
import { getActiveSession, getPreviousPerformance } from "@/lib/actions/workouts";
import { getExercises } from "@/lib/actions/exercises";
import WorkoutSessionClient from "@/components/workout/WorkoutSessionClient";

export default async function WorkoutPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  const session = await getActiveSession(sessionId);
  if (!session) notFound();
  if (session.finishedAt) redirect(`/history/${sessionId}`);

  const exerciseLibrary = await getExercises();

  const exercisesWithPrev = await Promise.all(
    session.exercises.map(async (we) => ({
      id: we.id,
      exerciseId: we.exerciseId,
      exercise: we.exercise,
      sets: we.sets,
      previousSets: await getPreviousPerformance(we.exerciseId, sessionId),
    })),
  );

  return (
    <WorkoutSessionClient
      sessionId={session.id}
      routineName={session.routineName}
      startedAt={session.startedAt.getTime()}
      initialExercises={exercisesWithPrev}
      exerciseLibrary={exerciseLibrary}
    />
  );
}
