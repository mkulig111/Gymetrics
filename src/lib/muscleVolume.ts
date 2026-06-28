import { getSessionDetail } from "@/lib/actions/history";
import { ExerciseType, SetType } from "@/generated/prisma";

function setLoad(
  type: ExerciseType,
  set: { weightKg: number | null; reps: number | null; seconds: number | null },
) {
  if (type === ExerciseType.WEIGHT_REPS && set.weightKg && set.reps) return set.weightKg * set.reps;
  if (type === ExerciseType.BODYWEIGHT_REPS && set.reps) return set.reps;
  if (type === ExerciseType.TIME && set.seconds) return set.seconds;
  return 0;
}

export function muscleVolume(
  session: NonNullable<Awaited<ReturnType<typeof getSessionDetail>>>,
) {
  const volume = new Map<string, number>();
  for (const we of session.exercises) {
    const load = we.sets
      .filter((s) => s.completed && s.type !== SetType.WARMUP)
      .reduce((sum, s) => sum + setLoad(we.exercise.type, s), 0);
    if (load === 0) continue;
    for (const bp of we.exercise.bodyParts) {
      const name = bp.bodyPart.name;
      volume.set(name, (volume.get(name) ?? 0) + load * (bp.percentage / 100));
    }
  }
  return [...volume.entries()]
    .map(([muscle, volume]) => ({ muscle, volume }))
    .sort((a, b) => b.volume - a.volume);
}
