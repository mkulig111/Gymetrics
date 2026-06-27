import { PrismaClient, ExerciseType } from "../src/generated/prisma";

const prisma = new PrismaClient();

const W = ExerciseType.WEIGHT_REPS;
const B = ExerciseType.BODYWEIGHT_REPS;
const T = ExerciseType.TIME;

const exercises: { name: string; muscleGroup: string; type: ExerciseType }[] = [
  // Chest
  { name: "Barbell Bench Press", muscleGroup: "Chest", type: W },
  { name: "Incline Barbell Bench Press", muscleGroup: "Chest", type: W },
  { name: "Decline Barbell Bench Press", muscleGroup: "Chest", type: W },
  { name: "Dumbbell Bench Press", muscleGroup: "Chest", type: W },
  { name: "Incline Dumbbell Press", muscleGroup: "Chest", type: W },
  { name: "Decline Dumbbell Press", muscleGroup: "Chest", type: W },
  { name: "Dumbbell Fly", muscleGroup: "Chest", type: W },
  { name: "Cable Fly", muscleGroup: "Chest", type: W },
  { name: "Incline Cable Fly", muscleGroup: "Chest", type: W },
  { name: "Pec Deck Machine", muscleGroup: "Chest", type: W },
  { name: "Machine Chest Press", muscleGroup: "Chest", type: W },
  { name: "Push Up", muscleGroup: "Chest", type: B },
  { name: "Incline Push Up", muscleGroup: "Chest", type: B },
  { name: "Decline Push Up", muscleGroup: "Chest", type: B },
  { name: "Diamond Push Up", muscleGroup: "Chest", type: B },
  { name: "Dips (Chest Lean)", muscleGroup: "Chest", type: B },
  // Back
  { name: "Deadlift", muscleGroup: "Back", type: W },
  { name: "Sumo Deadlift", muscleGroup: "Back", type: W },
  { name: "Pull Up", muscleGroup: "Back", type: B },
  { name: "Chin Up", muscleGroup: "Back", type: B },
  { name: "Lat Pulldown", muscleGroup: "Back", type: W },
  { name: "Wide Grip Lat Pulldown", muscleGroup: "Back", type: W },
  { name: "Close Grip Lat Pulldown", muscleGroup: "Back", type: W },
  { name: "Straight Arm Pulldown", muscleGroup: "Back", type: W },
  { name: "Barbell Row", muscleGroup: "Back", type: W },
  { name: "Pendlay Row", muscleGroup: "Back", type: W },
  { name: "T-Bar Row", muscleGroup: "Back", type: W },
  { name: "Seated Cable Row", muscleGroup: "Back", type: W },
  { name: "Single Arm Dumbbell Row", muscleGroup: "Back", type: W },
  { name: "Chest Supported Row", muscleGroup: "Back", type: W },
  { name: "Machine Row", muscleGroup: "Back", type: W },
  { name: "Inverted Row", muscleGroup: "Back", type: B },
  { name: "Good Morning", muscleGroup: "Lower Back", type: W },
  { name: "Back Extension", muscleGroup: "Lower Back", type: B },
  { name: "Superman", muscleGroup: "Lower Back", type: T },
  // Traps
  { name: "Barbell Shrug", muscleGroup: "Traps", type: W },
  { name: "Dumbbell Shrug", muscleGroup: "Traps", type: W },
  { name: "Farmer's Carry", muscleGroup: "Traps", type: T },
  // Shoulders
  { name: "Overhead Press", muscleGroup: "Shoulders", type: W },
  { name: "Seated Dumbbell Shoulder Press", muscleGroup: "Shoulders", type: W },
  { name: "Arnold Press", muscleGroup: "Shoulders", type: W },
  { name: "Machine Shoulder Press", muscleGroup: "Shoulders", type: W },
  { name: "Lateral Raise", muscleGroup: "Shoulders", type: W },
  { name: "Cable Lateral Raise", muscleGroup: "Shoulders", type: W },
  { name: "Front Raise", muscleGroup: "Shoulders", type: W },
  { name: "Rear Delt Fly", muscleGroup: "Shoulders", type: W },
  { name: "Face Pull", muscleGroup: "Shoulders", type: W },
  { name: "Upright Row", muscleGroup: "Shoulders", type: W },
  // Biceps
  { name: "Barbell Curl", muscleGroup: "Biceps", type: W },
  { name: "EZ Bar Curl", muscleGroup: "Biceps", type: W },
  { name: "Dumbbell Curl", muscleGroup: "Biceps", type: W },
  { name: "Hammer Curl", muscleGroup: "Biceps", type: W },
  { name: "Incline Dumbbell Curl", muscleGroup: "Biceps", type: W },
  { name: "Preacher Curl", muscleGroup: "Biceps", type: W },
  { name: "Cable Curl", muscleGroup: "Biceps", type: W },
  { name: "Concentration Curl", muscleGroup: "Biceps", type: W },
  // Triceps
  { name: "Triceps Pushdown", muscleGroup: "Triceps", type: W },
  { name: "Rope Triceps Pushdown", muscleGroup: "Triceps", type: W },
  { name: "Skullcrusher", muscleGroup: "Triceps", type: W },
  { name: "Overhead Triceps Extension", muscleGroup: "Triceps", type: W },
  { name: "Close Grip Bench Press", muscleGroup: "Triceps", type: W },
  { name: "Triceps Dip", muscleGroup: "Triceps", type: B },
  { name: "Bench Dip", muscleGroup: "Triceps", type: B },
  { name: "Diamond Push Up (Triceps)", muscleGroup: "Triceps", type: B },
  // Forearms
  { name: "Wrist Curl", muscleGroup: "Forearms", type: W },
  { name: "Reverse Wrist Curl", muscleGroup: "Forearms", type: W },
  { name: "Dead Hang", muscleGroup: "Forearms", type: T },
  // Quadriceps
  { name: "Back Squat", muscleGroup: "Quadriceps", type: W },
  { name: "Front Squat", muscleGroup: "Quadriceps", type: W },
  { name: "Goblet Squat", muscleGroup: "Quadriceps", type: W },
  { name: "Hack Squat", muscleGroup: "Quadriceps", type: W },
  { name: "Leg Press", muscleGroup: "Quadriceps", type: W },
  { name: "Leg Extension", muscleGroup: "Quadriceps", type: W },
  { name: "Bulgarian Split Squat", muscleGroup: "Quadriceps", type: W },
  { name: "Walking Lunge", muscleGroup: "Quadriceps", type: W },
  { name: "Reverse Lunge", muscleGroup: "Quadriceps", type: W },
  { name: "Step Up", muscleGroup: "Quadriceps", type: W },
  { name: "Sissy Squat", muscleGroup: "Quadriceps", type: B },
  { name: "Bodyweight Squat", muscleGroup: "Quadriceps", type: B },
  // Hamstrings
  { name: "Romanian Deadlift", muscleGroup: "Hamstrings", type: W },
  { name: "Stiff Leg Deadlift", muscleGroup: "Hamstrings", type: W },
  { name: "Leg Curl", muscleGroup: "Hamstrings", type: W },
  { name: "Seated Leg Curl", muscleGroup: "Hamstrings", type: W },
  { name: "Nordic Curl", muscleGroup: "Hamstrings", type: B },
  { name: "Glute Ham Raise", muscleGroup: "Hamstrings", type: B },
  // Glutes
  { name: "Hip Thrust", muscleGroup: "Glutes", type: W },
  { name: "Glute Bridge", muscleGroup: "Glutes", type: B },
  { name: "Cable Kickback", muscleGroup: "Glutes", type: W },
  { name: "Sumo Squat", muscleGroup: "Glutes", type: W },
  { name: "Hip Abduction Machine", muscleGroup: "Glutes", type: W },
  // Calves
  { name: "Standing Calf Raise", muscleGroup: "Calves", type: W },
  { name: "Seated Calf Raise", muscleGroup: "Calves", type: W },
  { name: "Leg Press Calf Raise", muscleGroup: "Calves", type: W },
  { name: "Single Leg Calf Raise", muscleGroup: "Calves", type: B },
  // Core / Abs
  { name: "Plank", muscleGroup: "Core", type: T },
  { name: "Side Plank", muscleGroup: "Core", type: T },
  { name: "Crunch", muscleGroup: "Core", type: B },
  { name: "Bicycle Crunch", muscleGroup: "Core", type: B },
  { name: "Sit Up", muscleGroup: "Core", type: B },
  { name: "Hanging Leg Raise", muscleGroup: "Core", type: B },
  { name: "Hanging Knee Raise", muscleGroup: "Core", type: B },
  { name: "Cable Crunch", muscleGroup: "Core", type: W },
  { name: "Russian Twist", muscleGroup: "Core", type: B },
  { name: "Ab Wheel Rollout", muscleGroup: "Core", type: B },
  { name: "Mountain Climbers", muscleGroup: "Core", type: T },
  { name: "Flutter Kicks", muscleGroup: "Core", type: T },
  { name: "Dead Bug", muscleGroup: "Core", type: B },
  // Full Body / Olympic / Conditioning
  { name: "Power Clean", muscleGroup: "Full Body", type: W },
  { name: "Clean and Jerk", muscleGroup: "Full Body", type: W },
  { name: "Snatch", muscleGroup: "Full Body", type: W },
  { name: "Kettlebell Swing", muscleGroup: "Full Body", type: W },
  { name: "Thruster", muscleGroup: "Full Body", type: W },
  { name: "Burpee", muscleGroup: "Full Body", type: B },
  { name: "Box Jump", muscleGroup: "Full Body", type: B },
  { name: "Battle Ropes", muscleGroup: "Full Body", type: T },
  { name: "Rowing Machine", muscleGroup: "Cardio", type: T },
  { name: "Treadmill Run", muscleGroup: "Cardio", type: T },
  { name: "Stationary Bike", muscleGroup: "Cardio", type: T },
  { name: "Jump Rope", muscleGroup: "Cardio", type: T },
  // Stretching / mobility
  { name: "Figure 4 Stretch", muscleGroup: "Glutes", type: T },
  { name: "90/90 Hip Stretch", muscleGroup: "Hips", type: T },
  { name: "Couch Stretch", muscleGroup: "Quadriceps", type: T },
  { name: "Half Kneeling Abductor Stretch", muscleGroup: "Hips", type: T },
  { name: "Thread The Needle", muscleGroup: "Back", type: T },
  { name: "Elevated Lat Stretch", muscleGroup: "Back", type: T },
  { name: "Cat-Cow Stretch", muscleGroup: "Back", type: T },
  { name: "World's Greatest Stretch", muscleGroup: "Hips", type: T },
  { name: "Pigeon Stretch", muscleGroup: "Glutes", type: T },
  { name: "Doorway Chest Stretch", muscleGroup: "Chest", type: T },
];

// Multi-body-part percentage breakdowns sourced from free-weights exercise data.
// Applied on every seed run (delete + recreate) so updated percentages always take effect.
const bodyPartOverrides: { exerciseName: string; bodyParts: { name: string; percentage: number }[] }[] = [
  { exerciseName: "Back Squat", bodyParts: [
    { name: "Quadriceps", percentage: 40 },
    { name: "Glutes", percentage: 30 },
    { name: "Hamstrings", percentage: 15 },
    { name: "Core", percentage: 7.5 },
    { name: "Lower Back", percentage: 7.5 },
  ]},
  { exerciseName: "Front Squat", bodyParts: [
    { name: "Quadriceps", percentage: 50 },
    { name: "Glutes", percentage: 20 },
    { name: "Core", percentage: 20 },
    { name: "Back", percentage: 10 },
  ]},
  { exerciseName: "Romanian Deadlift", bodyParts: [
    { name: "Hamstrings", percentage: 40 },
    { name: "Glutes", percentage: 30 },
    { name: "Lower Back", percentage: 20 },
    { name: "Core", percentage: 10 },
  ]},
  { exerciseName: "Deadlift", bodyParts: [
    { name: "Glutes", percentage: 20 },
    { name: "Hamstrings", percentage: 20 },
    { name: "Lower Back", percentage: 20 },
    { name: "Quadriceps", percentage: 15 },
    { name: "Back", percentage: 7.5 },
    { name: "Traps", percentage: 7.5 },
    { name: "Forearms", percentage: 5 },
    { name: "Core", percentage: 5 },
  ]},
  { exerciseName: "Walking Lunge", bodyParts: [
    { name: "Quadriceps", percentage: 40 },
    { name: "Glutes", percentage: 35 },
    { name: "Hamstrings", percentage: 15 },
    { name: "Core", percentage: 10 },
  ]},
  { exerciseName: "Reverse Lunge", bodyParts: [
    { name: "Quadriceps", percentage: 40 },
    { name: "Glutes", percentage: 35 },
    { name: "Hamstrings", percentage: 15 },
    { name: "Core", percentage: 10 },
  ]},
  { exerciseName: "Goblet Squat", bodyParts: [
    { name: "Quadriceps", percentage: 45 },
    { name: "Glutes", percentage: 30 },
    { name: "Core", percentage: 15 },
    { name: "Hamstrings", percentage: 10 },
  ]},
  { exerciseName: "Standing Calf Raise", bodyParts: [
    { name: "Calves", percentage: 90 },
  ]},
  { exerciseName: "Barbell Bench Press", bodyParts: [
    { name: "Chest", percentage: 50 },
    { name: "Triceps", percentage: 25 },
    { name: "Shoulders", percentage: 20 },
  ]},
  { exerciseName: "Dumbbell Bench Press", bodyParts: [
    { name: "Chest", percentage: 55 },
    { name: "Triceps", percentage: 25 },
    { name: "Shoulders", percentage: 15 },
  ]},
  { exerciseName: "Seated Dumbbell Shoulder Press", bodyParts: [
    { name: "Shoulders", percentage: 60 },
    { name: "Triceps", percentage: 25 },
    { name: "Traps", percentage: 10 },
    { name: "Core", percentage: 5 },
  ]},
  { exerciseName: "Dumbbell Fly", bodyParts: [
    { name: "Chest", percentage: 70 },
    { name: "Shoulders", percentage: 20 },
  ]},
  { exerciseName: "Barbell Row", bodyParts: [
    { name: "Back", percentage: 75 },
    { name: "Biceps", percentage: 15 },
    { name: "Shoulders", percentage: 5 },
    { name: "Lower Back", percentage: 5 },
  ]},
  { exerciseName: "Single Arm Dumbbell Row", bodyParts: [
    { name: "Back", percentage: 55 },
    { name: "Biceps", percentage: 20 },
    { name: "Shoulders", percentage: 15 },
    { name: "Core", percentage: 10 },
  ]},
  { exerciseName: "Barbell Curl", bodyParts: [
    { name: "Biceps", percentage: 80 },
    { name: "Forearms", percentage: 15 },
  ]},
  { exerciseName: "Lateral Raise", bodyParts: [
    { name: "Shoulders", percentage: 70 },
    { name: "Traps", percentage: 20 },
  ]},
  { exerciseName: "Overhead Triceps Extension", bodyParts: [
    { name: "Triceps", percentage: 85 },
    { name: "Shoulders", percentage: 10 },
    { name: "Core", percentage: 5 },
  ]},
  { exerciseName: "Farmer's Carry", bodyParts: [
    { name: "Forearms", percentage: 16.7 },
    { name: "Core", percentage: 16.7 },
    { name: "Traps", percentage: 16.7 },
    { name: "Quadriceps", percentage: 25 },
    { name: "Shoulders", percentage: 25 },
  ]},
  { exerciseName: "Thruster", bodyParts: [
    { name: "Quadriceps", percentage: 20 },
    { name: "Glutes", percentage: 20 },
    { name: "Shoulders", percentage: 30 },
    { name: "Triceps", percentage: 15 },
    { name: "Core", percentage: 15 },
  ]},
];

// Historical 5x5 training log (Squat / Bench Press / Deadlift), imported once and
// kept idempotent by checking for an existing session on each date before creating it.
const TRAINING_LOG_ROUTINE_NAME = "Squat / Bench / Deadlift";
const trainingLog: { date: string; squatKg: number; benchKg: number; deadliftKg: number }[] = [
  { date: "2026-06-05", squatKg: 65, benchKg: 46.25, deadliftKg: 100 },
  { date: "2026-06-08", squatKg: 67.5, benchKg: 50, deadliftKg: 102.5 },
  { date: "2026-06-12", squatKg: 70, benchKg: 47.5, deadliftKg: 105 },
  { date: "2026-06-18", squatKg: 72.5, benchKg: 50, deadliftKg: 107.5 },
  { date: "2026-06-21", squatKg: 75, benchKg: 47.5, deadliftKg: 110 },
  { date: "2026-06-24", squatKg: 77.5, benchKg: 50, deadliftKg: 112.5 },
];

// The training log was originally imported with the wrong year (2024 instead of
// 2026). Correct any already-imported sessions in place rather than creating
// duplicates, so the date fix applies idempotently on every deploy.
const trainingLogDateCorrections: Record<string, string> = {
  "2024-06-05": "2026-06-05",
  "2024-06-08": "2026-06-08",
  "2024-06-12": "2026-06-12",
  "2024-06-18": "2026-06-18",
  "2024-06-21": "2026-06-21",
  "2024-06-24": "2026-06-24",
};

async function main() {
  const bodyPartNames = [...new Set(exercises.map((e) => e.muscleGroup))];
  for (const name of bodyPartNames) {
    await prisma.bodyPart.upsert({ where: { name }, update: {}, create: { name } });
  }

  for (const e of exercises) {
    const existing = await prisma.exercise.findFirst({ where: { name: e.name } });
    if (!existing) {
      await prisma.exercise.create({
        data: {
          name: e.name,
          type: e.type,
          bodyParts: { create: [{ percentage: 100, bodyPart: { connect: { name: e.muscleGroup } } }] },
        },
      });
    }
  }
  console.log(`Seeded ${exercises.length} exercises across ${bodyPartNames.length} body parts`);

  let overridesApplied = 0;
  for (const override of bodyPartOverrides) {
    const exercise = await prisma.exercise.findFirst({ where: { name: override.exerciseName } });
    if (!exercise) continue;
    await prisma.exerciseBodyPart.deleteMany({ where: { exerciseId: exercise.id } });
    for (const bp of override.bodyParts) {
      const bodyPart = await prisma.bodyPart.findUnique({ where: { name: bp.name } });
      if (!bodyPart) continue;
      await prisma.exerciseBodyPart.create({
        data: { exerciseId: exercise.id, bodyPartId: bodyPart.id, percentage: bp.percentage },
      });
    }
    overridesApplied++;
  }
  console.log(`Applied body-part percentage overrides to ${overridesApplied} exercises`);

  // "Other" was a legacy catch-all muscle group from before exercises had proper
  // body-part assignments. Remove it so every exercise must be defined with real
  // body parts via the /exercises editor instead of falling back to a vague bucket.
  const other = await prisma.bodyPart.findUnique({ where: { name: "Other" } });
  if (other) {
    const affected = await prisma.exerciseBodyPart.count({ where: { bodyPartId: other.id } });
    await prisma.bodyPart.delete({ where: { id: other.id } });
    console.log(`Removed "Other" body part, leaving ${affected} exercise(s) needing proper body parts`);
  }

  let logDatesCorrected = 0;
  for (const [oldDate, newDate] of Object.entries(trainingLogDateCorrections)) {
    const oldStartedAt = new Date(`${oldDate}T12:00:00`);
    const existing = await prisma.workoutSession.findFirst({
      where: { routineName: TRAINING_LOG_ROUTINE_NAME, startedAt: oldStartedAt },
    });
    if (!existing) continue;
    const newStartedAt = new Date(`${newDate}T12:00:00`);
    await prisma.workoutSession.update({
      where: { id: existing.id },
      data: { startedAt: newStartedAt, finishedAt: new Date(newStartedAt.getTime() + 60 * 60 * 1000) },
    });
    logDatesCorrected++;
  }
  if (logDatesCorrected > 0) {
    console.log(`Corrected ${logDatesCorrected} training log session date(s) from 2024 to 2026`);
  }

  let logSessionsCreated = 0;
  for (const entry of trainingLog) {
    const startedAt = new Date(`${entry.date}T12:00:00`);
    const existing = await prisma.workoutSession.findFirst({
      where: { routineName: TRAINING_LOG_ROUTINE_NAME, startedAt },
    });
    if (existing) continue;

    const finishedAt = new Date(startedAt.getTime() + 60 * 60 * 1000);
    const session = await prisma.workoutSession.create({
      data: { routineName: TRAINING_LOG_ROUTINE_NAME, startedAt, finishedAt },
    });

    const lifts = [
      { exerciseName: "Back Squat", weightKg: entry.squatKg },
      { exerciseName: "Barbell Bench Press", weightKg: entry.benchKg },
      { exerciseName: "Deadlift", weightKg: entry.deadliftKg },
    ];

    for (let order = 0; order < lifts.length; order++) {
      const lift = lifts[order];
      const exercise = await prisma.exercise.findFirst({ where: { name: lift.exerciseName } });
      if (!exercise) continue;

      const priorSets = await prisma.workoutSet.findMany({
        where: {
          completed: true,
          weightKg: { not: null },
          workoutExercise: {
            exerciseId: exercise.id,
            sessionId: { not: session.id },
            session: { finishedAt: { not: null } },
          },
        },
      });
      const priorBest = priorSets.reduce<number | null>(
        (max, s) => (s.weightKg == null ? max : max == null ? s.weightKg : Math.max(max, s.weightKg)),
        null,
      );
      const isPr = priorBest == null || lift.weightKg > priorBest;

      await prisma.workoutExercise.create({
        data: {
          sessionId: session.id,
          exerciseId: exercise.id,
          order,
          sets: {
            create: Array.from({ length: 5 }, (_, i) => ({
              setIndex: i,
              weightKg: lift.weightKg,
              reps: 5,
              completed: true,
              isPr,
            })),
          },
        },
      });
    }
    logSessionsCreated++;
  }
  console.log(`Created ${logSessionsCreated} historical training-log sessions`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
