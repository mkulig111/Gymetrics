-- CreateEnum
CREATE TYPE "ProgrammeTemplate" AS ENUM ('CUSTOM', 'BBB', 'TRIUMVIRATE', 'FSL');
CREATE TYPE "MainLift" AS ENUM ('SQUAT', 'BENCH', 'DEADLIFT', 'PRESS');
CREATE TYPE "ProgressionCondition" AS ENUM ('AUTO', 'AMRAP_THRESHOLD');

-- AlterTable Programme
ALTER TABLE "Programme"
  ADD COLUMN "currentCycle"         INTEGER                NOT NULL DEFAULT 1,
  ADD COLUMN "templateType"         "ProgrammeTemplate"    NOT NULL DEFAULT 'CUSTOM',
  ADD COLUMN "tmSquat"              DOUBLE PRECISION,
  ADD COLUMN "tmBench"              DOUBLE PRECISION,
  ADD COLUMN "tmDeadlift"           DOUBLE PRECISION,
  ADD COLUMN "tmPress"              DOUBLE PRECISION,
  ADD COLUMN "tmPercentage"         DOUBLE PRECISION       NOT NULL DEFAULT 90,
  ADD COLUMN "roundingIncrement"    DOUBLE PRECISION       NOT NULL DEFAULT 2.5,
  ADD COLUMN "cycleLengthWeeks"     INTEGER                NOT NULL DEFAULT 4,
  ADD COLUMN "hasDeloadWeek"        BOOLEAN                NOT NULL DEFAULT false,
  ADD COLUMN "progressionUpper"     DOUBLE PRECISION       NOT NULL DEFAULT 2.5,
  ADD COLUMN "progressionLower"     DOUBLE PRECISION       NOT NULL DEFAULT 5.0,
  ADD COLUMN "progressionCondition" "ProgressionCondition" NOT NULL DEFAULT 'AUTO',
  ADD COLUMN "amrapThreshold"       INTEGER                NOT NULL DEFAULT 5;

-- CreateTable ProgrammeDay
CREATE TABLE "ProgrammeDay" (
  "id"                 TEXT NOT NULL,
  "programmeId"        TEXT NOT NULL,
  "dayOfWeek"          INTEGER NOT NULL,
  "mainLift"           "MainLift" NOT NULL,
  "assistanceCategory" "SetCategory" NOT NULL,
  CONSTRAINT "ProgrammeDay_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ProgrammeDay_programmeId_dayOfWeek_key" ON "ProgrammeDay"("programmeId", "dayOfWeek");
ALTER TABLE "ProgrammeDay"
  ADD CONSTRAINT "ProgrammeDay_programmeId_fkey"
  FOREIGN KEY ("programmeId") REFERENCES "Programme"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable ProgrammeWeekScheme
CREATE TABLE "ProgrammeWeekScheme" (
  "id"          TEXT NOT NULL,
  "programmeId" TEXT NOT NULL,
  "weekNum"     INTEGER NOT NULL,
  CONSTRAINT "ProgrammeWeekScheme_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ProgrammeWeekScheme_programmeId_weekNum_key" ON "ProgrammeWeekScheme"("programmeId", "weekNum");
ALTER TABLE "ProgrammeWeekScheme"
  ADD CONSTRAINT "ProgrammeWeekScheme_programmeId_fkey"
  FOREIGN KEY ("programmeId") REFERENCES "Programme"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable ProgrammeSetSchemeEntry
CREATE TABLE "ProgrammeSetSchemeEntry" (
  "id"           TEXT NOT NULL,
  "weekSchemeId" TEXT NOT NULL,
  "percent"      DOUBLE PRECISION NOT NULL,
  "reps"         INTEGER NOT NULL,
  "isAmrap"      BOOLEAN NOT NULL DEFAULT false,
  "setOrder"     INTEGER NOT NULL,
  CONSTRAINT "ProgrammeSetSchemeEntry_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "ProgrammeSetSchemeEntry"
  ADD CONSTRAINT "ProgrammeSetSchemeEntry_weekSchemeId_fkey"
  FOREIGN KEY ("weekSchemeId") REFERENCES "ProgrammeWeekScheme"("id") ON DELETE CASCADE ON UPDATE CASCADE;
