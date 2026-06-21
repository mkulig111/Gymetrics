import { notFound } from "next/navigation";
import { getSessionDetail } from "@/lib/actions/history";
import { muscleVolume } from "@/lib/muscleVolume";
import { ExerciseType } from "@/generated/prisma";
import { formatDuration } from "@/lib/types";

export default async function SessionDetailPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  const session = await getSessionDetail(sessionId);
  if (!session) notFound();

  const volume = muscleVolume(session);
  const duration = session.finishedAt
    ? session.finishedAt.getTime() - session.startedAt.getTime()
    : 0;

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold">{session.routineName}</h1>
        <p className="text-sm text-muted">
          {session.startedAt.toLocaleDateString(undefined, {
            weekday: "long",
            month: "short",
            day: "numeric",
            year: "numeric",
          })}{" "}
          &middot; {formatDuration(duration)}
        </p>
      </div>

      {volume.length > 0 && (
        <div className="rounded-xl bg-surface p-4">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">
            Muscle Volume
          </h2>
          <div className="space-y-1">
            {volume.map((v) => (
              <div key={v.muscle} className="flex justify-between text-sm">
                <span>{v.muscle}</span>
                <span className="font-semibold">{v.sets} sets</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        {session.exercises.map((we) => (
          <div key={we.id} className="rounded-xl bg-surface p-4">
            <h3 className="mb-2 font-bold text-accent">{we.exercise.name}</h3>
            <div className="space-y-1">
              {we.sets
                .filter((s) => s.completed)
                .map((s) => (
                  <div key={s.id} className="flex items-center justify-between text-sm">
                    <span className="text-muted">Set {s.setIndex + 1}</span>
                    <span>
                      {we.exercise.type === ExerciseType.TIME
                        ? `${s.seconds ?? 0} sec`
                        : we.exercise.type === ExerciseType.BODYWEIGHT_REPS
                          ? `${s.reps ?? 0} reps`
                          : `${s.weightKg ?? 0}kg x ${s.reps ?? 0}`}
                    </span>
                    {s.isPr && <span className="text-accent">🏆 PR</span>}
                  </div>
                ))}
              {we.sets.filter((s) => s.completed).length === 0 && (
                <p className="text-sm text-muted">No sets completed.</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
