"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { ExerciseType } from "@/generated/prisma";

export async function getLifetimeStats() {
  const sessions = await prisma.workoutSession.findMany({
    where: { finishedAt: { not: null } },
  });
  const totalWorkouts = sessions.length;
  const totalMs = sessions.reduce((sum, s) => {
    if (!s.finishedAt) return sum;
    return sum + (s.finishedAt.getTime() - s.startedAt.getTime());
  }, 0);
  const totalHours = totalMs / 1000 / 60 / 60;

  const sets = await prisma.workoutSet.findMany({
    where: { completed: true, workoutExercise: { session: { finishedAt: { not: null } } } },
    include: { workoutExercise: { include: { exercise: true } } },
  });

  let totalVolumeKg = 0;
  let totalPRs = 0;
  for (const s of sets) {
    if (s.isPr) totalPRs++;
    if (s.workoutExercise.exercise.type === ExerciseType.WEIGHT_REPS && s.weightKg && s.reps) {
      totalVolumeKg += s.weightKg * s.reps;
    }
  }

  return { totalWorkouts, totalHours, totalVolumeKg, totalPRs };
}

export type MuscleVolumeInterval = "daily" | "weekly" | "monthly" | "all";

const INTERVAL_DAYS: Record<"daily" | "weekly" | "monthly", number> = {
  daily: 1,
  weekly: 7,
  monthly: 30,
};

export async function getMuscleVolumeReport(interval: MuscleVolumeInterval) {
  const rangeEnd = new Date();
  let rangeStart: Date;
  if (interval === "all") {
    const earliest = await prisma.workoutSession.findFirst({
      where: { finishedAt: { not: null } },
      orderBy: { startedAt: "asc" },
      select: { startedAt: true },
    });
    rangeStart = earliest?.startedAt ?? rangeEnd;
  } else {
    rangeStart = new Date(rangeEnd);
    rangeStart.setDate(rangeStart.getDate() - (INTERVAL_DAYS[interval] - 1));
    rangeStart.setHours(0, 0, 0, 0);
  }

  const sets = await prisma.workoutSet.findMany({
    where: {
      completed: true,
      workoutExercise: {
        session: { finishedAt: { not: null }, startedAt: { gte: rangeStart } },
      },
    },
    include: {
      workoutExercise: {
        include: { exercise: { include: { bodyParts: { include: { bodyPart: true } } } } },
      },
    },
  });

  let totalVolumeKg = 0;
  let totalSets = 0;
  let totalReps = 0;
  const muscleMap = new Map<string, number>();

  for (const s of sets) {
    totalSets++;
    const exercise = s.workoutExercise.exercise;
    let load = 0;
    if (exercise.type === ExerciseType.WEIGHT_REPS && s.weightKg && s.reps) {
      load = s.weightKg * s.reps;
      totalVolumeKg += load;
      totalReps += s.reps;
    } else if (exercise.type === ExerciseType.BODYWEIGHT_REPS && s.reps) {
      load = s.reps;
      totalReps += s.reps;
    } else if (exercise.type === ExerciseType.TIME && s.seconds) {
      load = s.seconds;
    }
    if (load === 0) continue;
    for (const bp of exercise.bodyParts) {
      const name = bp.bodyPart.name;
      muscleMap.set(name, (muscleMap.get(name) ?? 0) + load * (bp.percentage / 100));
    }
  }

  const muscleVolume = [...muscleMap.entries()]
    .map(([muscle, volume]) => ({ muscle, volume }))
    .sort((a, b) => b.volume - a.volume);

  return { interval, rangeStart, rangeEnd, totalVolumeKg, totalSets, totalReps, muscleVolume };
}

export async function getWorkoutDates() {
  const sessions = await prisma.workoutSession.findMany({
    where: { finishedAt: { not: null } },
    select: { startedAt: true },
  });
  return sessions.map((s) => s.startedAt);
}

export async function getBodyweightEntries() {
  return prisma.bodyweightEntry.findMany({ orderBy: { date: "asc" } });
}

export async function addBodyweightEntry(weightKg: number, date?: Date) {
  await prisma.bodyweightEntry.create({
    data: { weightKg, date: date ?? new Date() },
  });
  revalidatePath("/progress");
}

export async function getProgressPhotos() {
  return prisma.progressPhoto.findMany({ orderBy: { date: "desc" } });
}

export async function addProgressPhoto(imageData: string) {
  await prisma.progressPhoto.create({ data: { imageData } });
  revalidatePath("/progress");
}

export async function deleteProgressPhoto(id: string) {
  await prisma.progressPhoto.delete({ where: { id } });
  revalidatePath("/progress");
}

export async function getGripStrengthEntries() {
  return prisma.gripStrengthEntry.findMany({ orderBy: { date: "asc" } });
}

export async function addGripStrengthEntry(kg: number, date?: Date) {
  await prisma.gripStrengthEntry.create({
    data: { kg, date: date ?? new Date() },
  });
  revalidatePath("/progress");
}

export async function getHrvEntries() {
  return prisma.hrvEntry.findMany({ orderBy: { date: "asc" } });
}

export async function addHrvEntry(rmssd: number, date?: Date) {
  await prisma.hrvEntry.create({
    data: { rmssd, date: date ?? new Date() },
  });
  revalidatePath("/progress");
}

export async function getWellnessEntries() {
  return prisma.wellnessEntry.findMany({ orderBy: { date: "asc" } });
}

export async function addWellnessEntry(score: number, date?: Date) {
  await prisma.wellnessEntry.create({
    data: { score, date: date ?? new Date() },
  });
  revalidatePath("/progress");
}
