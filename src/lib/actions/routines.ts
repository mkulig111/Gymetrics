"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function getRoutines() {
  return prisma.routine.findMany({
    orderBy: { order: "asc" },
    include: {
      exercises: {
        orderBy: { order: "asc" },
        include: { exercise: true, sets: true },
      },
    },
  });
}

export async function getRoutine(id: string) {
  return prisma.routine.findUnique({
    where: { id },
    include: {
      exercises: {
        orderBy: { order: "asc" },
        include: { exercise: true, sets: { orderBy: { setIndex: "asc" } } },
      },
    },
  });
}

export async function createRoutine(name: string) {
  const count = await prisma.routine.count();
  const routine = await prisma.routine.create({
    data: { name: name.trim() || "New Routine", order: count },
  });
  revalidatePath("/train");
  return routine;
}

export async function updateRoutineDetails(
  routineId: string,
  data: { name?: string; notes?: string },
) {
  await prisma.routine.update({ where: { id: routineId }, data });
  revalidatePath("/train");
  revalidatePath(`/train/routines/${routineId}/edit`);
}

export async function deleteRoutine(routineId: string) {
  await prisma.routine.delete({ where: { id: routineId } });
  revalidatePath("/train");
}

export async function addExerciseToRoutine(routineId: string, exerciseId: string) {
  const count = await prisma.routineExercise.count({ where: { routineId } });
  const re = await prisma.routineExercise.create({
    data: {
      routineId,
      exerciseId,
      order: count,
      sets: { create: [{ setIndex: 0 }] },
    },
    include: { exercise: true, sets: true },
  });
  revalidatePath(`/train/routines/${routineId}/edit`);
  return re;
}

export async function removeExerciseFromRoutine(routineExerciseId: string, routineId: string) {
  await prisma.routineExercise.delete({ where: { id: routineExerciseId } });
  revalidatePath(`/train/routines/${routineId}/edit`);
}

export async function swapRoutineExercise(
  routineExerciseId: string,
  newExerciseId: string,
  routineId: string,
) {
  await prisma.routineExercise.update({
    where: { id: routineExerciseId },
    data: { exerciseId: newExerciseId },
  });
  revalidatePath(`/train/routines/${routineId}/edit`);
}

export async function addSetToRoutineExercise(routineExerciseId: string, routineId: string) {
  const lastSet = await prisma.routineSet.findFirst({
    where: { routineExerciseId },
    orderBy: { setIndex: "desc" },
  });
  const set = await prisma.routineSet.create({
    data: {
      routineExerciseId,
      setIndex: lastSet ? lastSet.setIndex + 1 : 0,
      targetReps: lastSet?.targetReps,
      targetWeightKg: lastSet?.targetWeightKg,
      targetSeconds: lastSet?.targetSeconds,
    },
  });
  revalidatePath(`/train/routines/${routineId}/edit`);
  return set;
}

export async function removeRoutineSet(routineSetId: string, routineId: string) {
  await prisma.routineSet.delete({ where: { id: routineSetId } });
  revalidatePath(`/train/routines/${routineId}/edit`);
}

export async function updateRoutineSet(
  routineSetId: string,
  data: { targetReps?: number | null; targetWeightKg?: number | null; targetSeconds?: number | null },
  routineId: string,
) {
  await prisma.routineSet.update({ where: { id: routineSetId }, data });
  revalidatePath(`/train/routines/${routineId}/edit`);
}
