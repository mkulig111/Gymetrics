import { getSessionDetail } from "@/lib/actions/history";

export function muscleVolume(
  session: NonNullable<Awaited<ReturnType<typeof getSessionDetail>>>,
) {
  const volume = new Map<string, number>();
  for (const we of session.exercises) {
    const completedSets = we.sets.filter((s) => s.completed).length;
    if (completedSets === 0) continue;
    volume.set(
      we.exercise.muscleGroup,
      (volume.get(we.exercise.muscleGroup) ?? 0) + completedSets,
    );
  }
  return [...volume.entries()]
    .map(([muscle, sets]) => ({ muscle, sets }))
    .sort((a, b) => b.sets - a.sets);
}
