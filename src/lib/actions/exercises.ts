"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { ExerciseType } from "@/generated/prisma";

const exerciseInclude = {
  bodyParts: { include: { bodyPart: true }, orderBy: { percentage: "desc" as const } },
};

export async function getExercises() {
  return prisma.exercise.findMany({ orderBy: { name: "asc" }, include: exerciseInclude });
}

export async function getExercise(id: string) {
  return prisma.exercise.findUnique({ where: { id }, include: exerciseInclude });
}

export async function getBodyParts() {
  return prisma.bodyPart.findMany({ orderBy: { name: "asc" } });
}

export async function createBodyPart(name: string) {
  const trimmed = name.trim();
  if (!trimmed) throw new Error("Body part name is required");
  const bodyPart = await prisma.bodyPart.create({ data: { name: trimmed } });
  revalidatePath("/exercises");
  return bodyPart;
}

export async function createCustomExercise(
  name: string,
  type: ExerciseType = ExerciseType.WEIGHT_REPS,
  bodyParts: { bodyPartId: string; percentage: number }[] = [],
) {
  const trimmed = name.trim();
  if (!trimmed) throw new Error("Exercise name is required");
  const exercise = await prisma.exercise.create({
    data: {
      name: trimmed,
      type,
      isCustom: true,
      bodyParts: { create: bodyParts.map((bp) => ({ bodyPartId: bp.bodyPartId, percentage: bp.percentage })) },
    },
    include: exerciseInclude,
  });
  revalidatePath("/exercises");
  return exercise;
}

export async function updateExercise(
  exerciseId: string,
  data: { name: string; type: ExerciseType; bodyParts: { bodyPartId: string; percentage: number }[] },
) {
  const trimmed = data.name.trim();
  if (!trimmed) throw new Error("Exercise name is required");
  await prisma.$transaction([
    prisma.exercise.update({ where: { id: exerciseId }, data: { name: trimmed, type: data.type } }),
    prisma.exerciseBodyPart.deleteMany({ where: { exerciseId } }),
    prisma.exerciseBodyPart.createMany({
      data: data.bodyParts.map((bp) => ({
        exerciseId,
        bodyPartId: bp.bodyPartId,
        percentage: bp.percentage,
      })),
    }),
  ]);
  revalidatePath("/exercises");
  revalidatePath(`/exercises/${exerciseId}/edit`);
}
