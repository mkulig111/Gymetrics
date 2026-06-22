import { notFound } from "next/navigation";
import { getSessionDetail } from "@/lib/actions/history";
import { getExercises } from "@/lib/actions/exercises";
import HistoryEditClient from "@/components/history/HistoryEditClient";

export default async function EditHistorySessionPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  const session = await getSessionDetail(sessionId);
  if (!session) notFound();

  const exerciseLibrary = await getExercises();

  return (
    <HistoryEditClient
      sessionId={session.id}
      routineName={session.routineName}
      startedAt={session.startedAt.getTime()}
      initialExercises={session.exercises.map((we) => ({
        id: we.id,
        exerciseId: we.exerciseId,
        exercise: we.exercise,
        sets: we.sets,
      }))}
      exerciseLibrary={exerciseLibrary}
    />
  );
}
