import Link from "next/link";
import { IconDumbbell, IconClock, IconPencil, IconTrash } from "@tabler/icons-react";
import { getHistory } from "@/lib/actions/history";
import { formatDuration } from "@/lib/types";
import DeleteWorkoutButton from "@/components/history/DeleteWorkoutButton";
import ExportButton from "@/components/history/ExportButton";

export default async function HistoryPage() {
  const sessions = await getHistory();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-sm font-semibold uppercase tracking-wide text-muted">Workout History</h1>
        <ExportButton />
      </div>
      {sessions.length === 0 ? (
        <p className="rounded-xl bg-surface p-6 text-center text-sm text-muted">
          No completed workouts yet. Finish a workout to see it here.
        </p>
      ) : (
        sessions.map((s) => {
          const completedSets = s.exercises.reduce(
            (sum, e) => sum + e.sets.filter((x) => x.completed).length,
            0,
          );
          const duration = s.finishedAt ? s.finishedAt.getTime() - s.startedAt.getTime() : 0;
          return (
            <div key={s.id} className="rounded-xl bg-surface p-4 hover:bg-surface-2">
              <Link href={`/history/${s.id}`} className="block">
                <div className="mb-1 flex items-center justify-between">
                  <span className="font-bold">{s.routineName}</span>
                  <span className="text-xs text-muted">
                    {s.startedAt.toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <p className="flex items-center gap-1 text-sm text-muted">
                  <IconDumbbell className="h-3.5 w-3.5 shrink-0" stroke={1.5} />
                  {s.exercises.length} exercises &middot; {completedSets} sets &middot;
                  <IconClock className="h-3.5 w-3.5 shrink-0" stroke={1.5} />
                  {formatDuration(duration)}
                </p>
              </Link>
              <div className="mt-2 flex justify-end gap-4 text-xs">
                <Link href={`/history/${s.id}/edit`} className="flex items-center gap-1 text-muted hover:text-accent">
                  <IconPencil className="h-3.5 w-3.5" stroke={1.5} /> Edit
                </Link>
                <DeleteWorkoutButton sessionId={s.id} className="flex items-center gap-1 text-muted hover:text-danger">
                  <IconTrash className="h-3.5 w-3.5" stroke={1.5} /> Delete
                </DeleteWorkoutButton>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
