"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SetCategory } from "@/generated/prisma";

const INCLUDE_FULL = {
  weeks: {
    orderBy: { weekNumber: "asc" as const },
    include: { schemes: { orderBy: { category: "asc" as const } } },
  },
};

export async function getProgrammes() {
  return prisma.programme.findMany({
    where: { archived: false },
    orderBy: { createdAt: "asc" },
    include: INCLUDE_FULL,
  });
}

export async function getProgramme(id: string) {
  return prisma.programme.findUnique({ where: { id }, include: INCLUDE_FULL });
}

export async function createProgramme() {
  const programme = await prisma.programme.create({
    data: {
      name: "New Programme",
      weeks: {
        create: {
          weekNumber: 1,
          schemes: {
            create: [
              { category: SetCategory.MAIN, sets: 3, reps: 5 },
              { category: SetCategory.DROP_OFF, sets: 2, reps: 3 },
              { category: SetCategory.OTHER, sets: 4, reps: 8 },
            ],
          },
        },
      },
    },
  });
  revalidatePath("/train");
  redirect(`/train/programmes/${programme.id}/edit`);
}

export async function updateProgrammeDetails(
  id: string,
  data: { name?: string; notes?: string },
) {
  await prisma.programme.update({ where: { id }, data });
  revalidatePath("/train");
  revalidatePath(`/train/programmes/${id}/edit`);
}

export async function addWeek(programmeId: string) {
  const last = await prisma.programmeWeek.findFirst({
    where: { programmeId },
    orderBy: { weekNumber: "desc" },
  });
  const weekNumber = last ? last.weekNumber + 1 : 1;
  const prevSchemes = last
    ? await prisma.programmeSetScheme.findMany({ where: { weekId: last.id } })
    : [];

  const week = await prisma.programmeWeek.create({
    data: {
      programmeId,
      weekNumber,
      schemes: {
        create:
          prevSchemes.length > 0
            ? prevSchemes.map((s) => ({ category: s.category, sets: s.sets, reps: s.reps }))
            : [
                { category: SetCategory.MAIN, sets: 3, reps: 5 },
                { category: SetCategory.DROP_OFF, sets: 2, reps: 3 },
                { category: SetCategory.OTHER, sets: 4, reps: 8 },
              ],
      },
    },
    include: { schemes: { orderBy: { category: "asc" } } },
  });
  revalidatePath(`/train/programmes/${programmeId}/edit`);
  return week;
}

export async function removeWeek(weekId: string, programmeId: string) {
  await prisma.programmeWeek.delete({ where: { id: weekId } });
  // renumber remaining weeks
  const remaining = await prisma.programmeWeek.findMany({
    where: { programmeId },
    orderBy: { weekNumber: "asc" },
  });
  await Promise.all(
    remaining.map((w, i) =>
      prisma.programmeWeek.update({ where: { id: w.id }, data: { weekNumber: i + 1 } }),
    ),
  );
  revalidatePath(`/train/programmes/${programmeId}/edit`);
}

export async function updateWeekLabel(weekId: string, label: string, programmeId: string) {
  await prisma.programmeWeek.update({ where: { id: weekId }, data: { label: label || null } });
  revalidatePath(`/train/programmes/${programmeId}/edit`);
}

export async function updateScheme(
  schemeId: string,
  data: { sets?: number; reps?: number },
  programmeId: string,
) {
  await prisma.programmeSetScheme.update({ where: { id: schemeId }, data });
  revalidatePath(`/train/programmes/${programmeId}/edit`);
}

export async function addSchemeCategory(
  weekId: string,
  category: SetCategory,
  programmeId: string,
) {
  const scheme = await prisma.programmeSetScheme.create({
    data: { weekId, category, sets: 3, reps: 5 },
  });
  revalidatePath(`/train/programmes/${programmeId}/edit`);
  return scheme;
}

export async function removeSchemeCategory(schemeId: string, programmeId: string) {
  await prisma.programmeSetScheme.delete({ where: { id: schemeId } });
  revalidatePath(`/train/programmes/${programmeId}/edit`);
}

export async function advanceProgrammeWeek(programmeId: string) {
  const prog = await prisma.programme.findUnique({
    where: { id: programmeId },
    include: { weeks: true },
  });
  if (!prog) return;
  const maxWeek = prog.weeks.length;
  const next = prog.currentWeek >= maxWeek ? 1 : prog.currentWeek + 1;
  await prisma.programme.update({ where: { id: programmeId }, data: { currentWeek: next } });
  revalidatePath("/train");
}

export async function deleteProgramme(id: string) {
  await prisma.programme.delete({ where: { id } });
  revalidatePath("/train");
  redirect("/train");
}

export async function archiveProgramme(id: string) {
  await prisma.programme.update({ where: { id }, data: { archived: true } });
  revalidatePath("/train");
}
