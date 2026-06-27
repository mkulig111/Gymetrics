-- CreateTable
CREATE TABLE "BodyPart" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BodyPart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExerciseBodyPart" (
    "id" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "bodyPartId" TEXT NOT NULL,
    "percentage" DOUBLE PRECISION NOT NULL DEFAULT 100,

    CONSTRAINT "ExerciseBodyPart_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BodyPart_name_key" ON "BodyPart"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ExerciseBodyPart_exerciseId_bodyPartId_key" ON "ExerciseBodyPart"("exerciseId", "bodyPartId");

-- AddForeignKey
ALTER TABLE "ExerciseBodyPart" ADD CONSTRAINT "ExerciseBodyPart_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciseBodyPart" ADD CONSTRAINT "ExerciseBodyPart_bodyPartId_fkey" FOREIGN KEY ("bodyPartId") REFERENCES "BodyPart"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill: turn each distinct existing muscleGroup value into a BodyPart row
INSERT INTO "BodyPart" ("id", "name")
SELECT gen_random_uuid()::text, t."muscleGroup"
FROM (SELECT DISTINCT "muscleGroup" FROM "Exercise" WHERE "muscleGroup" IS NOT NULL) t;

-- Backfill: link every existing exercise to its former muscleGroup at 100%
INSERT INTO "ExerciseBodyPart" ("id", "exerciseId", "bodyPartId", "percentage")
SELECT gen_random_uuid()::text, e."id", bp."id", 100
FROM "Exercise" e
JOIN "BodyPart" bp ON bp."name" = e."muscleGroup";

-- AlterTable
ALTER TABLE "Exercise" DROP COLUMN "muscleGroup";
