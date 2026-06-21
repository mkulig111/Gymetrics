function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function mondayOf(d: Date) {
  const day = d.getDay();
  const diff = (day + 6) % 7;
  const monday = new Date(d);
  monday.setDate(d.getDate() - diff);
  return startOfDay(monday);
}

export function buildStreakGrid(workoutDates: Date[], weeksToShow = 5) {
  const today = startOfDay(new Date());
  const daySet = new Set(workoutDates.map((d) => startOfDay(d).getTime()));
  const currentMonday = mondayOf(today);
  const firstMonday = new Date(currentMonday);
  firstMonday.setDate(firstMonday.getDate() - 7 * (weeksToShow - 1));

  const weeks: { date: Date; hasWorkout: boolean; isToday: boolean }[][] = [];
  for (let w = 0; w < weeksToShow; w++) {
    const week: { date: Date; hasWorkout: boolean; isToday: boolean }[] = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(firstMonday);
      date.setDate(firstMonday.getDate() + w * 7 + d);
      week.push({
        date,
        hasWorkout: daySet.has(date.getTime()),
        isToday: date.getTime() === today.getTime(),
      });
    }
    weeks.push(week);
  }
  return weeks;
}

export function computeWeekStreak(workoutDates: Date[]) {
  const today = startOfDay(new Date());
  const daySet = new Set(workoutDates.map((d) => startOfDay(d).getTime()));
  let monday = mondayOf(today);
  let streak = 0;

  function weekHasWorkout(monday: Date) {
    for (let d = 0; d < 7; d++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + d);
      if (date > today) continue;
      if (daySet.has(date.getTime())) return true;
    }
    return false;
  }

  while (weekHasWorkout(monday)) {
    streak++;
    monday = new Date(monday);
    monday.setDate(monday.getDate() - 7);
  }
  return streak;
}
