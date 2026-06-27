"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export async function getHistory() {
  return prisma.workoutSession.findMany({
    where: { finishedAt: { not: null } },
    orderBy: { startedAt: "desc" },
    include: {
      exercises: {
        include: { exercise: { include: { bodyParts: { include: { bodyPart: true } } } }, sets: true },
      },
    },
  });
}

export async function getSessionDetail(sessionId: string) {
  return prisma.workoutSession.findUnique({
    where: { id: sessionId },
    include: {
      exercises: {
        orderBy: { order: "asc" },
        include: { exercise: { include: { bodyParts: { include: { bodyPart: true } } } }, sets: { orderBy: { setIndex: "asc" } } },
      },
    },
  });
}

export async function deleteWorkoutSession(sessionId: string) {
  await prisma.workoutSession.delete({ where: { id: sessionId } });
  revalidatePath("/history");
  revalidatePath("/progress");
  redirect("/history");
}
