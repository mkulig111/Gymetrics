"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ExerciseType } from "@/generated/prisma";

export async function startWorkoutFromRoutine(routineId: string) {
  const routine = await prisma.routine.findUnique({
    where: { id: routineId },
    include: { exercises: { orderBy: { order: "asc" }, include: { sets: { orderBy: { setIndex: "asc" } } } } },
  });
  if (!routine) throw new Error("Routine not found");

  const session = await prisma.workoutSession.create({
    data: {
      routineId: routine.id,
      routineName: routine.name,
      exercises: {
        create: routine.exercises.map((re, order) => ({
          exerciseId: re.exerciseId,
          order,
          sets: {
            create: re.sets.map((s) => ({
              setIndex: s.setIndex,
              weightKg: s.targetWeightKg,
              seconds: null,
              reps: s.targetReps,
            })),
          },
        })),
      },
    },
  });
  redirect(`/workout/${session.id}`);
}

export async function startEmptyWorkout() {
  const session = await prisma.workoutSession.create({
    data: { routineName: "Empty Workout" },
  });
  redirect(`/workout/${session.id}`);
}

export async function getActiveSession(id: string) {
  return prisma.workoutSession.findUnique({
    where: { id },
    include: {
      exercises: {
        orderBy: { order: "asc" },
        include: { exercise: true, sets: { orderBy: { setIndex: "asc" } } },
      },
    },
  });
}

export async function getPreviousPerformance(exerciseId: string, excludeSessionId: string) {
  const prevWe = await prisma.workoutExercise.findFirst({
    where: {
      exerciseId,
      sessionId: { not: excludeSessionId },
      session: { finishedAt: { not: null } },
    },
    orderBy: { session: { startedAt: "desc" } },
    include: { sets: { orderBy: { setIndex: "asc" } } },
  });
  return prevWe?.sets ?? [];
}

export async function toggleSetComplete(setId: string, completed: boolean, sessionId: string) {
  await prisma.workoutSet.update({ where: { id: setId }, data: { completed } });
  revalidatePath(`/workout/${sessionId}`);
}

export async function updateWorkoutSet(
  setId: string,
  data: { weightKg?: number | null; reps?: number | null; seconds?: number | null },
  sessionId: string,
) {
  await prisma.workoutSet.update({ where: { id: setId }, data });
  revalidatePath(`/workout/${sessionId}`);
}

export async function addSetToWorkoutExercise(workoutExerciseId: string, sessionId: string) {
  const lastSet = await prisma.workoutSet.findFirst({
    where: { workoutExerciseId },
    orderBy: { setIndex: "desc" },
  });
  const set = await prisma.workoutSet.create({
    data: {
      workoutExerciseId,
      setIndex: lastSet ? lastSet.setIndex + 1 : 0,
      weightKg: lastSet?.weightKg,
      reps: lastSet?.reps,
      seconds: lastSet?.seconds,
    },
  });
  revalidatePath(`/workout/${sessionId}`);
  return set;
}

export async function removeWorkoutSet(setId: string, sessionId: string) {
  await prisma.workoutSet.delete({ where: { id: setId } });
  revalidatePath(`/workout/${sessionId}`);
}

export async function addExerciseToWorkout(sessionId: string, exerciseId: string) {
  const count = await prisma.workoutExercise.count({ where: { sessionId } });
  const we = await prisma.workoutExercise.create({
    data: {
      sessionId,
      exerciseId,
      order: count,
      sets: { create: [{ setIndex: 0 }] },
    },
    include: { exercise: true, sets: true },
  });
  revalidatePath(`/workout/${sessionId}`);
  return we;
}

export async function removeWorkoutExercise(workoutExerciseId: string, sessionId: string) {
  await prisma.workoutExercise.delete({ where: { id: workoutExerciseId } });
  revalidatePath(`/workout/${sessionId}`);
}

export async function swapWorkoutExercise(
  workoutExerciseId: string,
  newExerciseId: string,
  sessionId: string,
) {
  await prisma.workoutExercise.update({
    where: { id: workoutExerciseId },
    data: { exerciseId: newExerciseId },
  });
  revalidatePath(`/workout/${sessionId}`);
}

function bestValue(type: ExerciseType, set: { weightKg: number | null; reps: number | null; seconds: number | null }) {
  if (type === ExerciseType.WEIGHT_REPS) return set.weightKg ?? null;
  if (type === ExerciseType.BODYWEIGHT_REPS) return set.reps ?? null;
  return set.seconds ?? null;
}

export async function finishWorkout(sessionId: string) {
  const session = await prisma.workoutSession.findUnique({
    where: { id: sessionId },
    include: { exercises: { include: { exercise: true, sets: true } } },
  });
  if (!session) throw new Error("Session not found");

  for (const we of session.exercises) {
    const completedSets = we.sets.filter((s) => s.completed);
    if (completedSets.length === 0) continue;

    const priorSets = await prisma.workoutSet.findMany({
      where: {
        completed: true,
        workoutExercise: {
          exerciseId: we.exerciseId,
          sessionId: { not: sessionId },
          session: { finishedAt: { not: null } },
        },
      },
    });
    const priorBest = priorSets.reduce<number | null>((max, s) => {
      const v = bestValue(we.exercise.type, s);
      if (v == null) return max;
      return max == null ? v : Math.max(max, v);
    }, null);

    for (const set of completedSets) {
      const v = bestValue(we.exercise.type, set);
      if (v != null && (priorBest == null || v > priorBest)) {
        await prisma.workoutSet.update({ where: { id: set.id }, data: { isPr: true } });
      }
    }
  }

  await prisma.workoutSession.update({
    where: { id: sessionId },
    data: { finishedAt: new Date() },
  });

  revalidatePath("/history");
  revalidatePath("/progress");
  redirect(`/history/${sessionId}`);
}

export async function discardWorkout(sessionId: string) {
  await prisma.workoutSession.delete({ where: { id: sessionId } });
  revalidatePath("/history");
  redirect("/train");
}
