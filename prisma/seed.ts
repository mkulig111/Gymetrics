import { PrismaClient, ExerciseType } from "../src/generated/prisma";

const prisma = new PrismaClient();

const W = ExerciseType.WEIGHT_REPS;
const B = ExerciseType.BODYWEIGHT_REPS;
const T = ExerciseType.TIME;

const exercises: { name: string; muscleGroup: string; type: ExerciseType }[] = [
  // Chest
  { name: "Barbell Bench Press", muscleGroup: "Chest", type: W },
  { name: "Incline Dumbbell Press", muscleGroup: "Chest", type: W },
  { name: "Cable Fly", muscleGroup: "Chest", type: W },
  { name: "Push Up", muscleGroup: "Chest", type: B },
  // Back
  { name: "Deadlift", muscleGroup: "Back", type: W },
  { name: "Pull Up", muscleGroup: "Back", type: B },
  { name: "Lat Pulldown", muscleGroup: "Back", type: W },
  { name: "Barbell Row", muscleGroup: "Back", type: W },
  { name: "Seated Cable Row", muscleGroup: "Back", type: W },
  // Shoulders
  { name: "Overhead Press", muscleGroup: "Shoulders", type: W },
  { name: "Lateral Raise", muscleGroup: "Shoulders", type: W },
  { name: "Face Pull", muscleGroup: "Shoulders", type: W },
  // Arms
  { name: "Barbell Curl", muscleGroup: "Biceps", type: W },
  { name: "Hammer Curl", muscleGroup: "Biceps", type: W },
  { name: "Triceps Pushdown", muscleGroup: "Triceps", type: W },
  { name: "Skullcrusher", muscleGroup: "Triceps", type: W },
  // Legs
  { name: "Back Squat", muscleGroup: "Quadriceps", type: W },
  { name: "Leg Press", muscleGroup: "Quadriceps", type: W },
  { name: "Leg Extension", muscleGroup: "Quadriceps", type: W },
  { name: "Romanian Deadlift", muscleGroup: "Hamstrings", type: W },
  { name: "Leg Curl", muscleGroup: "Hamstrings", type: W },
  { name: "Hip Thrust", muscleGroup: "Glutes", type: W },
  { name: "Walking Lunge", muscleGroup: "Glutes", type: W },
  { name: "Standing Calf Raise", muscleGroup: "Calves", type: W },
  // Core
  { name: "Plank", muscleGroup: "Core", type: T },
  { name: "Hanging Leg Raise", muscleGroup: "Core", type: B },
  { name: "Cable Crunch", muscleGroup: "Core", type: W },
  // Stretching / mobility (from reference routine)
  { name: "Figure 4 Stretch", muscleGroup: "Glutes", type: T },
  { name: "90/90 Hip Stretch", muscleGroup: "Hips", type: T },
  { name: "Couch Stretch", muscleGroup: "Quadriceps", type: T },
  { name: "Half Kneeling Abductor Stretch", muscleGroup: "Hips", type: T },
  { name: "Thread The Needle", muscleGroup: "Back", type: T },
  { name: "Elevated Lat Stretch", muscleGroup: "Back", type: T },
];

async function main() {
  for (const e of exercises) {
    const existing = await prisma.exercise.findFirst({ where: { name: e.name } });
    if (!existing) {
      await prisma.exercise.create({ data: e });
    }
  }
  console.log(`Seeded ${exercises.length} exercises`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
