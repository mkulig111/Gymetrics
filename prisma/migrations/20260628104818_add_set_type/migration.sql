-- CreateEnum
CREATE TYPE "SetType" AS ENUM ('WORK', 'WARMUP', 'DROP', 'FAILURE');

-- AlterTable
ALTER TABLE "WorkoutSet" ADD COLUMN     "type" "SetType" NOT NULL DEFAULT 'WORK';
