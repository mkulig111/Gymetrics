"use server";

import { prisma } from "@/lib/prisma";
import { ExerciseType } from "@/generated/prisma";

export async function getExercises() {
  return prisma.exercise.findMany({ orderBy: { name: "asc" } });
}

export async function createCustomExercise(
  name: string,
  muscleGroup: string,
  type: ExerciseType = ExerciseType.WEIGHT_REPS,
) {
  const trimmed = name.trim();
  if (!trimmed) throw new Error("Exercise name is required");
  return prisma.exercise.create({
    data: { name: trimmed, muscleGroup, type, isCustom: true },
  });
}
