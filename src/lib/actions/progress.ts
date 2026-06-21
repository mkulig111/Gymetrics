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
