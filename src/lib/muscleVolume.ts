import { getSessionDetail } from "@/lib/actions/history";

export function muscleVolume(
  session: NonNullable<Awaited<ReturnType<typeof getSessionDetail>>>,
) {
  const volume = new Map<string, number>();
  for (const we of session.exercises) {
    const completedSets = we.sets.filter((s) => s.completed).length;
    if (completedSets === 0) continue;
    for (const bp of we.exercise.bodyParts) {
      const name = bp.bodyPart.name;
      volume.set(name, (volume.get(name) ?? 0) + completedSets * (bp.percentage / 100));
    }
  }
  return [...volume.entries()]
    .map(([muscle, sets]) => ({ muscle, sets }))
    .sort((a, b) => b.sets - a.sets);
}
