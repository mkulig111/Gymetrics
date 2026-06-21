"use server";

import { prisma } from "@/lib/prisma";

export async function getHistory() {
  return prisma.workoutSession.findMany({
    where: { finishedAt: { not: null } },
    orderBy: { startedAt: "desc" },
    include: {
      exercises: {
        include: { exercise: true, sets: true },
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
        include: { exercise: true, sets: { orderBy: { setIndex: "asc" } } },
      },
    },
  });
}
