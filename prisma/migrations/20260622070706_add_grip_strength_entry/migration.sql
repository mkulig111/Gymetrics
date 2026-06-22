-- CreateTable
CREATE TABLE "GripStrengthEntry" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "kg" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "GripStrengthEntry_pkey" PRIMARY KEY ("id")
);
