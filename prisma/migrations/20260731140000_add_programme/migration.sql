CREATE TYPE "SetCategory" AS ENUM ('MAIN', 'DROP_OFF', 'OTHER');

CREATE TABLE "Programme" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "notes" TEXT,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "currentWeek" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Programme_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ProgrammeWeek" (
    "id" TEXT NOT NULL,
    "programmeId" TEXT NOT NULL,
    "weekNumber" INTEGER NOT NULL,
    "label" TEXT,
    CONSTRAINT "ProgrammeWeek_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ProgrammeSetScheme" (
    "id" TEXT NOT NULL,
    "weekId" TEXT NOT NULL,
    "category" "SetCategory" NOT NULL,
    "sets" INTEGER NOT NULL DEFAULT 3,
    "reps" INTEGER NOT NULL DEFAULT 5,
    CONSTRAINT "ProgrammeSetScheme_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ProgrammeWeek_programmeId_weekNumber_key" ON "ProgrammeWeek"("programmeId", "weekNumber");
CREATE UNIQUE INDEX "ProgrammeSetScheme_weekId_category_key" ON "ProgrammeSetScheme"("weekId", "category");

ALTER TABLE "ProgrammeWeek" ADD CONSTRAINT "ProgrammeWeek_programmeId_fkey" FOREIGN KEY ("programmeId") REFERENCES "Programme"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProgrammeSetScheme" ADD CONSTRAINT "ProgrammeSetScheme_weekId_fkey" FOREIGN KEY ("weekId") REFERENCES "ProgrammeWeek"("id") ON DELETE CASCADE ON UPDATE CASCADE;
