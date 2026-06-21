import {
  getBodyweightEntries,
  getLifetimeStats,
  getProgressPhotos,
  getWorkoutDates,
} from "@/lib/actions/progress";
import StreakCalendar from "@/components/progress/StreakCalendar";
import BodyweightChart from "@/components/progress/BodyweightChart";
import ProgressPhotos from "@/components/progress/ProgressPhotos";

export default async function ProgressPage() {
  const [stats, workoutDates, bodyweight, photos] = await Promise.all([
    getLifetimeStats(),
    getWorkoutDates(),
    getBodyweightEntries(),
    getProgressPhotos(),
  ]);

  return (
    <div className="space-y-4 pb-12">
      <h1 className="text-2xl font-bold">My Progress</h1>

      <div className="grid grid-cols-2 gap-4">
        <StreakCalendar workoutDates={workoutDates} />
        <div className="rounded-xl bg-surface p-4">
          <h2 className="mb-3 text-lg font-bold">Lifetime Stats</h2>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-2xl font-extrabold text-accent">{stats.totalWorkouts}</p>
              <p className="text-xs text-muted">Workouts</p>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-accent">
                {stats.totalHours >= 1000 ? `${Math.round(stats.totalHours / 1000)}k` : Math.round(stats.totalHours)}
              </p>
              <p className="text-xs text-muted">Hours</p>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-accent">
                {stats.totalVolumeKg >= 1000
                  ? `${Math.round(stats.totalVolumeKg / 1000)}k`
                  : Math.round(stats.totalVolumeKg)}
              </p>
              <p className="text-xs text-muted">kg Lifted</p>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-accent">{stats.totalPRs}</p>
              <p className="text-xs text-muted">PRs</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <BodyweightChart entries={bodyweight} />
        <ProgressPhotos photos={photos} />
      </div>
    </div>
  );
}
