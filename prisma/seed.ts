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
