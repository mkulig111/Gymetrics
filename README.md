# Gymetrics

A self-hosted gym workout tracker: build routines, log active workout sessions with rest timers and a plate calculator, and review history and progress analytics (streaks, lifetime stats, bodyweight, and progress photos).

## Stack

- Next.js (App Router, Server Actions)
- Prisma + SQLite
- Tailwind CSS

## Getting Started

```bash
npm install
npx prisma migrate dev
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Features

- **Train** — create routines with exercises/sets, start a workout from a routine or empty, track elapsed time, rest timer, plate calculator, and muscle volume per session.
- **History** — browse finished workout sessions, see completed sets, muscle volume, and personal records (PRs).
- **Progress** — week streak calendar, lifetime stats (workouts, hours, kg lifted, PRs), bodyweight chart, and progress photo gallery.
