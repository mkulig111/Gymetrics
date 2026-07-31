"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SetCategory, MainLift, ProgrammeTemplate, ProgressionCondition } from "@/generated/prisma";

const INCLUDE_FULL = {
  weeks: {
    orderBy: { weekNumber: "asc" as const },
    include: { schemes: { orderBy: { category: "asc" as const } } },
  },
  days: { orderBy: { dayOfWeek: "asc" as const } },
  weekSchemes: {
    orderBy: { weekNum: "asc" as const },
    include: { entries: { orderBy: { setOrder: "asc" as const } } },
  },
};

// Standard 5/3/1 week scheme (shared by BBB, FSL, Triumvirate)
const TEMPLATE_531_WEEKS = [
  { weekNum: 1, entries: [{ percent: 65, reps: 5, isAmrap: false }, { percent: 75, reps: 5, isAmrap: false }, { percent: 85, reps: 5, isAmrap: true }] },
  { weekNum: 2, entries: [{ percent: 70, reps: 3, isAmrap: false }, { percent: 80, reps: 3, isAmrap: false }, { percent: 90, reps: 3, isAmrap: true }] },
  { weekNum: 3, entries: [{ percent: 75, reps: 5, isAmrap: false }, { percent: 85, reps: 3, isAmrap: false }, { percent: 95, reps: 1, isAmrap: true }] },
  { weekNum: 4, entries: [{ percent: 40, reps: 5, isAmrap: false }, { percent: 50, reps: 5, isAmrap: false }, { percent: 60, reps: 5, isAmrap: false }] },
];

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
      templateType: ProgrammeTemplate.CUSTOM,
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

export async function updateProgrammeSettings(
  id: string,
  data: {
    tmSquat?: number | null;
    tmBench?: number | null;
    tmDeadlift?: number | null;
    tmPress?: number | null;
    tmPercentage?: number;
    roundingIncrement?: number;
    cycleLengthWeeks?: number;
    hasDeloadWeek?: boolean;
    progressionUpper?: number;
    progressionLower?: number;
    progressionCondition?: ProgressionCondition;
    amrapThreshold?: number;
  },
) {
  await prisma.programme.update({ where: { id }, data });
  revalidatePath("/train");
  revalidatePath(`/train/programmes/${id}/edit`);
}

export async function setTemplate(programmeId: string, template: ProgrammeTemplate) {
  await prisma.programme.update({
    where: { id: programmeId },
    data: { templateType: template, currentWeek: 1 },
  });

  if (template !== ProgrammeTemplate.CUSTOM) {
    // Replace week schemes with 5/3/1 defaults
    await prisma.programmeWeekScheme.deleteMany({ where: { programmeId } });
    for (const week of TEMPLATE_531_WEEKS) {
      await prisma.programmeWeekScheme.create({
        data: {
          programmeId,
          weekNum: week.weekNum,
          entries: { create: week.entries.map((e, i) => ({ ...e, setOrder: i })) },
        },
      });
    }
    await prisma.programme.update({
      where: { id: programmeId },
      data: { cycleLengthWeeks: 4, hasDeloadWeek: true },
    });
  }

  revalidatePath("/train");
  revalidatePath(`/train/programmes/${programmeId}/edit`);
}

export async function updateWeekSchemeEntry(
  entryId: string,
  data: { percent?: number; reps?: number; isAmrap?: boolean },
  programmeId: string,
) {
  await prisma.programmeSetSchemeEntry.update({ where: { id: entryId }, data });
  revalidatePath(`/train/programmes/${programmeId}/edit`);
}

export async function setProgrammeDays(
  programmeId: string,
  days: { dayOfWeek: number; mainLift: MainLift; assistanceCategory: SetCategory }[],
) {
  await prisma.programmeDay.deleteMany({ where: { programmeId } });
  if (days.length > 0) {
    await prisma.programmeDay.createMany({
      data: days.map((d) => ({ ...d, programmeId })),
    });
  }
  revalidatePath("/train");
  revalidatePath(`/train/programmes/${programmeId}/edit`);
}

// ── CUSTOM template helpers (unchanged) ──────────────────────────────────────

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

export async function addSchemeCategory(weekId: string, category: SetCategory, programmeId: string) {
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

// ── Programme lifecycle ───────────────────────────────────────────────────────

export async function advanceProgrammeWeek(programmeId: string) {
  const prog = await prisma.programme.findUnique({
    where: { id: programmeId },
    include: { weeks: true, weekSchemes: true },
  });
  if (!prog) return;

  const totalWeeks =
    prog.templateType === ProgrammeTemplate.CUSTOM
      ? prog.weeks.length
      : prog.weekSchemes.length || prog.cycleLengthWeeks;

  const isLastWeek = prog.currentWeek >= totalWeeks;
  const nextWeek = isLastWeek ? 1 : prog.currentWeek + 1;
  const nextCycle = isLastWeek ? prog.currentCycle + 1 : prog.currentCycle;

  // Auto-progress training maxes on cycle completion
  if (isLastWeek && prog.templateType !== ProgrammeTemplate.CUSTOM) {
    const upper = prog.progressionUpper;
    const lower = prog.progressionLower;
    await prisma.programme.update({
      where: { id: programmeId },
      data: {
        currentWeek: nextWeek,
        currentCycle: nextCycle,
        tmSquat: prog.tmSquat != null ? prog.tmSquat + lower : undefined,
        tmBench: prog.tmBench != null ? prog.tmBench + upper : undefined,
        tmDeadlift: prog.tmDeadlift != null ? prog.tmDeadlift + lower : undefined,
        tmPress: prog.tmPress != null ? prog.tmPress + upper : undefined,
      },
    });
  } else {
    await prisma.programme.update({
      where: { id: programmeId },
      data: { currentWeek: nextWeek, currentCycle: nextCycle },
    });
  }

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
